// queues/tweetPermissionQueue.ts
import Queue from 'bull';

export const permissionQueue = new Queue('tweetPermissions', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3,
  }
});