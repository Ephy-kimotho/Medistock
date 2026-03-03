"use server"

import { prisma } from "@/lib/prisma";
import { requireRole, getServerSession } from "@/lib/check-permissions"
import { Prisma } from "@/generated/prisma/client"


export async function getUsersStats() {

    const totalUsers = await prisma.user.count();

    const admins = await prisma.user.count({
        where: {
            role: "admin"
        }
    })

    const normalUsers = await prisma.user.count({
        where: {
            role: "user"
        }
    })

    const inventoryManagers = await prisma.user.count({
        where: {
            role: "inventory_manager"
        }
    })

    return {
        totalUsers,
        admins,
        normalUsers,
        inventoryManagers
    }

}

export async function getApplicationUsers() {
    try {

        // Ensure only admins can get users.
        await requireRole(["admin"])

        // Get the current user
        const session = await getServerSession()
        const user = session?.user

        if (!user) {
            throw new Error("There is no logged in admin user.")
        }

        console.log("User role:", user.role)
        // Building the where clause 
        // TODO: add search and filters
        const where: Prisma.UserWhereInput = {
            id: {
                not: user.id
            }
        }

        const users = await prisma.user.findMany({
            where
        })

        console.log(users)
        return users

    } catch (error) {
        console.error("Error fetching users: ", error);
        throw error
    }
}