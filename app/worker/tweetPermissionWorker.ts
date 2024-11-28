// backgroundJobs.ts
import { PrismaClient } from '@prisma/client';
import { updateQueue } from '~/shared/queueConfig';

const prisma = new PrismaClient();

export async function updateChildTweets(tweetId: string, finalViewUserIds: string[], finalEditUserIds: string[]) {
  const childTweets = await prisma.tweet.findMany({
    where: { parentTweetId: tweetId },
    select: { id: true, inheritEdit: true, inheritView: true }
  });

  for (const childTweet of childTweets) {
    if (!childTweet.inheritEdit && !childTweet.inheritView)
      continue;
    const data: any = {};
    if (childTweet.inheritView)
      data.viewUserIds = finalViewUserIds;
    if (childTweet.inheritEdit)
      data.editUserIds = finalEditUserIds;
    await prisma.tweet.update({
      where: { id: childTweet.id },
      data: data,
    });

    // Recursively update descendants
    await updateChildTweets(childTweet.id, finalViewUserIds, finalEditUserIds);
  }
}
updateQueue.process(async (job) => {
  try {
    console.log('Incoming Job:', job);
    console.log('Processing tweet update:', job.data);
    const { tweetId, finalViewUserIds, finalEditUserIds } = job.data;
    await updateChildTweets(tweetId, finalViewUserIds, finalEditUserIds);
  } catch (error) {
    console.error('Failed to process tweet update:', error);
    throw error; // Bull will handle retry
  }
});

updateQueue.on('ready', () => {
  console.log('[Worker] Queue is ready to process jobs');
});

updateQueue.on('active', (job) => {
  console.log(`[Worker] Job ${job.id} has started processing`);
});

updateQueue.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} has completed`);
});

updateQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

updateQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

process.on('SIGTERM', async () => {
  await updateQueue.close();
  await prisma.$disconnect();
  process.exit(0);
});