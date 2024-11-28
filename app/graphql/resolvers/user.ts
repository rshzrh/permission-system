
import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../errors';
import { generateErrorRef } from '~/util/logUtil';

const prisma = new PrismaClient();

export const userResolvers = {
    Mutation: {
        createUser: async (_: any, { input }: { input: any }) => {

            const userId = input.id;
            let existingUser;
            try {
                existingUser = await prisma.user.findUnique({ where: { id: userId } });

                if (existingUser) {
                    return {
                        id: existingUser.id,
                        message: 'User already exists'
                    };
                }
                const user = await prisma.user.create({
                    data: {
                        id: input.id
                    }
                });


                return {
                    id: user.id,
                };
            } catch (e) {
                const errorReference = generateErrorRef()
                return new ValidationError('Internal Error | ' + errorReference);
            }

        }
    }
};
