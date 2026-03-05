"use server"

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireRole, getServerSession } from "@/lib/check-permissions";
import { Prisma } from "@/generated/prisma/client";
import { LIMIT } from "@/lib/utils";
import type { GetUsersProps, Role, } from "@/lib/types";

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

export async function getApplicationUsers({ page = 1, role, search }: GetUsersProps) {
    try {

        // Ensure only admins can get users.
        await requireRole(["admin"])

        // Get the current user
        const session = await getServerSession()
        const user = session?.user

        if (!user) {
            throw new Error("There is no logged in admin user.")
        }


        // Building the where clause 
        const where: Prisma.UserWhereInput = {
            id: {
                not: user.id
            },

            ...(search && {
                OR: [
                    {
                        name: { contains: search, mode: "insensitive" }
                    },
                    {
                        email: {
                            contains: search, mode: "insensitive"
                        }
                    }
                ],
            }),


            ...(role !== "all" && {
                role
            })


        }

        const users = await prisma.user.findMany({
            where,
            orderBy: {
                createdAt: "desc"
            },
            take: LIMIT,
            skip: (page - 1) * LIMIT
        })

        const totalUsers = await prisma.user.count({
            where
        })

        const totalPages = Math.ceil(totalUsers / LIMIT)
        const hasNext = page < totalPages
        const hasPrev = page > 1 && page <= totalPages


        return { users, totalPages, currentPage: page, hasNext, hasPrev }

    } catch (error) {
        console.error("Error fetching users: ", error);
        throw error
    }
}

export async function updateUserRole({ userId, role }: { userId: string, role: Role }) {
    try {
        const { user } = await auth.api.setRole({
            body: {
                userId,
                role
            },

            headers: await headers(),
        });

        revalidatePath("/users");

        return {
            success: true,
            message: `${user.name}'s role updated successfully.`,
            user
        }

    } catch (error) {
        console.error("Error updating user role:", error)
        throw error
    }

}

export async function getUserProfile(userId: string) {

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    return user
}

export async function changeUserPassword(password: string, userId: string) {
    const data = await auth.api.setUserPassword({
        headers: await headers(),
        body: {
            newPassword: password,
            userId: userId,
        }
    });

    return { status: data.status }
}

export async function allowEmailNotifications(allow: boolean, userId: string) {
    try {

        await requireRole(["admin", "inventory_manager"])

        const result = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                emailAlertEnabled: allow
            }
        })

        const message = result.emailAlertEnabled ? "Email alerts enabled successfully." : "Email alerts disbaled successfully."

        return {
            success: true,
            message
        }

    } catch (error) {
        console.error("Error configuring alerts: ", error);
        throw error
    }

}