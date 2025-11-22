"use server"

import { db } from "@/lib/db"
import { currentuser } from "@/modules/auth/actions"
// import { prisma } from "@/lib/prisma"; // or however you set it up

export const getAllPlaygroundForUser = async () => {
    const user = await currentuser();
    try {
        const playground = await db.playground.findMany({
            where: {
                userId: user?.id,
            },
            include: {
                user: true
            }
        })
        return playground;
    }
    catch (error) {
        console.log(error);
    }
} 