import { PrismaClient } from '@prisma/client';
import { User } from '@prisma/client';

const prisma = new PrismaClient();

export const getUser = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });

    return user;
}

export const createUser = async (user: User) => {
    return await prisma.user.create({
        data: {
            ...user
        }
    });
}