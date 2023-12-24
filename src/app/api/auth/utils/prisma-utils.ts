import { User } from '@prisma/client';
import PrismaClientSingleton from '@/clients/prisma-client';

const prisma = PrismaClientSingleton.getInstance(); 
export const getUser = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id
        }, 
        include: {
            token: true
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