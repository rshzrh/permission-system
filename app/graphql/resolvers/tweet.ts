
import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../errors';
import Queue from 'bull';
import { updateQueue } from '~/shared/queueConfig';


const prisma = new PrismaClient({ log: ['query'] });

async function getUserIdsFromGroups(groupIds: string[]): Promise<string[]> {
    try {
        if (!groupIds || groupIds.length === 0) {
            return [];
        }
        //load group ids from db where they are the parent of the groups in groupIds
        const childGroupsIds = await prisma.groupGroup.findMany({
            where: { parentId: { in: groupIds } },
            select: { childId: true },
        });

        groupIds.concat(childGroupsIds.map((g) => g.childId));

        // Get direct user memberships
        const groupUsers = await prisma.groupUser.findMany({
            where: { groupId: { in: groupIds } },
            select: { userId: true },
        });

        const userIds = groupUsers.map((g) => g.userId);

        return userIds;
    } catch (e) {
        console.error(e);
        return []
    }

}

export const tweetResolvers = {
    Query: {
        paginateTweets: async (
            _: any,
            { userId, limit, page }: { userId: string; limit: number; page: number }
        ) => {
            const skip = Math.max((page - 1) * limit, 0);

            // Fetch tweets where the user has view permission
            const tweets = await prisma.tweet.findMany({
                where: {
                    OR: [
                        { authorId: userId }, // User's own tweets
                        { viewUserIds: { has: userId } }, // Tweets the user can view
                        { viewUserIds: { isEmpty: true } }, // Tweets with no view permissions set
                    ],
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            });



            const hasNextPage = tweets.length === limit;

            return {
                nodes: tweets,
                hasNextPage,
            };
        },

        canEditTweet: async (_: any, { userId, tweetId }: { userId: string, tweetId: string }) => {
            const tweet = await prisma.tweet.findUnique({
                where: { id: tweetId },
                include: { author: true, parent: true },
            });

            if (!tweet) return false;

            if (tweet.authorId === userId) {
                return true;
            }

            if (tweet.editUserIds && tweet.editUserIds.length > 0)
                return tweet.editUserIds.includes(userId);

            return false;

        }
    },

    Mutation: {
        createTweet: async (_: any, { input }: { input: any }) => {
            const authorId = input.authorId;
            const user = await prisma.user.findUnique({ where: { id: authorId } });
            if (!user) {
                throw new ValidationError(`Author with ID ${input.authorId} not found`);
            }
            const content = input.content;
            if (!content || content.length === 0) {
                throw new ValidationError(`Content cannot be empty`);
            }
            const location = input.location;
            if (!location || location.length === 0) {
                throw new ValidationError(`Location cannot be empty`);
            }
            const category = input.category;
            if (!category) {
                throw new ValidationError(`Category cannot be empty`);
            }
            const parentTweetId = input.parentTweetId;
            if (parentTweetId) {
                const parentTweet = await prisma.tweet.findUnique({ where: { id: parentTweetId } });
                if (!parentTweet) {
                    throw new ValidationError(`Tweet with ID ${parentTweetId} not found`);
                }
            }
            return prisma.tweet.create({
                data: {
                    authorId: authorId,
                    content: content,
                    hashtags: input.hashtags || [],
                    parentTweetId: parentTweetId,
                    category: category,
                    location: location
                }
            });
        },

        updateTweetPermissions: async (_: any, { input }: { input: any }) => {

            const inheritEditPermissions = input.inheritEditPermissions;
            const inheritViewPermissions = input.inheritViewPermissions;
            const viewUserIds = input.viewPermissionsUsers || [];
            const editUserIds = input.editPermissionsUsers || [];
            const viewGroupIds = input.viewPermissionsGroups || [];
            const editGroupIds = input.editPermissionsGroups || [];

            const tweetId = input.tweetId;

            const tweet = await prisma.tweet.findUnique({ where: { id: tweetId }, include: { parent: true } });
            if (!tweet) {
                throw new ValidationError(`Tweet with ID ${tweetId} not found`);
            }
            let finalViewUserIds: string[] = [];
            let finalEditUserIds: string[] = [];

            if (inheritViewPermissions) {
                if (tweet.parentTweetId) {
                    // Inherit view permissions from parent
                    const parentTweet = await prisma.tweet.findUnique({
                        where: { id: tweet.parentTweetId },
                        select: { viewUserIds: true },
                    });
                    if (!parentTweet) {
                        throw new ValidationError(
                            `Parent tweet with ID ${tweet.parentTweetId} not found`
                        );
                    }
                    finalViewUserIds = parentTweet.viewUserIds;
                } else {
                    throw new ValidationError(
                        `Cannot inherit view permissions for tweet with no parent`
                    );
                }
            } else if (viewUserIds.length > 0 || viewGroupIds.length > 0) {
                // Not inheriting view permissions
                const groupUserIds = await getUserIdsFromGroups(viewGroupIds);
                finalViewUserIds = [...new Set([...viewUserIds, ...groupUserIds])];
            }

            //TODO: check if all userIds in finalViewUserIds exist in the db


            if (inheritEditPermissions) {
                if (tweet.parentTweetId) {
                    // Inherit edit permissions from parent
                    const parentTweet = await prisma.tweet.findUnique({
                        where: { id: tweet.parentTweetId },
                        select: { editUserIds: true },
                    });
                    if (!parentTweet) {
                        throw new ValidationError(
                            `Parent tweet with ID ${tweet.parentTweetId} not found`
                        );
                    }
                    finalEditUserIds = parentTweet.editUserIds;
                } else {
                    throw new ValidationError(
                        `Cannot inherit edit permissions for tweet with no parent`
                    );
                }
            } else if (editUserIds.length > 0 || editGroupIds.length > 0) {
                // Not inheriting edit permissions
                const groupUserIds = await getUserIdsFromGroups(editGroupIds);
                finalEditUserIds = [...new Set([...editUserIds, ...groupUserIds])];
            }

            //TODO: check if all userIds in finalEditUserIds exist in the db

            if (finalEditUserIds.length > 0 || finalViewUserIds.length > 0) {
                const updateData: any = { inheritView: inheritViewPermissions, inheritEdit: inheritEditPermissions };
                if (finalEditUserIds.length > 0)
                    updateData.editUserIds = finalEditUserIds;
                if (finalViewUserIds.length > 0)
                    updateData.viewUserIds = finalViewUserIds;
                await prisma.tweet.update({
                    where: { id: tweetId },
                    data: updateData,
                });
            }


            await updateQueue.add({
                tweetId,
                finalViewUserIds,
                finalEditUserIds
            },
                {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000
                    }
                });
            return true;

        }
    }
};