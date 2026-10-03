import { PrismaClient } from '@prisma/client';
import { getConfig } from '../config/env';

let prismaClient: PrismaClient | undefined;

export const getPrisma = (): PrismaClient => {
    if (!prismaClient) {
        const env = getConfig();
        prismaClient = new PrismaClient({
            datasourceUrl: env.DATABASE_URL
        });
    }
    return prismaClient;
};

export const connectPrisma = async () => {
    const client = getPrisma();
    await client.$connect();
};

export const disconnectPrisma = async () => {
    if (prismaClient) {
        await prismaClient.$disconnect();
        prismaClient = undefined;
    }
};
