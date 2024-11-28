
import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../errors';
import { generateErrorRef } from '~/util/logUtil';

const prisma = new PrismaClient();

export const groupResolvers = {
    Query: {
        getGroup: async (_: any, { id }: { id: string }) => {
            try {
                const group = await prisma.group.findUnique({
                    where: { id },
                    include: {
                        users: true,
                        subgroups: true
                    }
                });

                if (!group) {
                    throw new ValidationError('Group not found');
                }

                return {
                    id: group.id,
                    userIds: group.users.map(u => u.userId),
                    groupIds: group.subgroups.map(g => g.childId)
                };
            } catch (e) {
                const errorReference = generateErrorRef()
                return new ValidationError('Internal Error | ' + errorReference);
            }

        },
        listAllGroups: async () => {
            try {
                const groups = await prisma.group.findMany({
                    include: {
                        users: true,
                        subgroups: true
                    }
                });

                return groups.map(group => ({
                    id: group.id,
                    userIds: group.users.map(u => u.userId),
                    groupIds: group.subgroups.map(g => g.childId)
                }));
            } catch (e) {
                const errorReference = generateErrorRef()
                return new ValidationError('Internal Error | ' + errorReference);
            }

        },
        listUserGroups: async (_: any, { userId }: { userId: string }) => {
            try {
                const groups = await prisma.group.findMany({
                    where: {
                        users: {
                            some: {
                                userId
                            }
                        }
                    },
                    include: {
                        users: true,
                        subgroups: true
                    }
                });

                return groups.map(group => ({
                    id: group.id,
                    userIds: group.users.map(u => u.userId),
                    groupIds: group.subgroups.map(g => g.childId)
                }));
            } catch (e) {
                const errorReference = generateErrorRef()
                return new ValidationError('Internal Error | ' + errorReference);
            }

        }
    },
    Mutation: {
        createGroup: async (_: any, { input }: { input: { userIds: string[], groupIds: string[] } }) => {
            try {
                const userIds = input.userIds;
                const groupIds = input.groupIds;

                if (userIds.length === 0 && groupIds.length === 0) {
                    throw new ValidationError('UserIds and GroupIds cannot be empty at the same time');
                }
                const uniqueUserIds = Array.from(new Set(userIds));
                const uniqueGroupIds = Array.from(new Set(groupIds));

                const group = await prisma.group.create({
                    data: {
                        users: {
                            create: uniqueUserIds.map(userId => ({
                                userId
                            }))
                        },
                        subgroups: {
                            create: uniqueGroupIds.map(childId => ({
                                childId
                            }))
                        }
                    },
                    include: {
                        users: true,
                        subgroups: true
                    }
                });

                return {
                    id: group.id,
                    userIds: group.users.map(u => u.userId),
                    groupIds: group.subgroups.map(g => g.childId)
                };
            } catch (e) {
                const errorReference = generateErrorRef()
                return new ValidationError('Internal Error | ' + errorReference);
            }

        },

    }

};