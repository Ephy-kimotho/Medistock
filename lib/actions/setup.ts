"use server"

import { revalidatePath } from "next/cache"
import { auth } from "../auth"
import { prisma } from "../prisma"
import type { SetupSchema } from "../schemas/setup"

export async function createAdminUser({ name, email, password }: SetupSchema) {
    try {

        // Ensure that there are no users in the system before creating an admin
        const userCount = await prisma.user.count()

        if (userCount > 0) {
            return {
                success: false,
                message: "Admin account already exists. Setup is only allowed for the first user.",
            };
        }

        // Create the first admin user
        await auth.api.createUser({
            body: {
                name,
                email,
                password,
                role: "admin",
                data: {
                    emailVerified: true,
                },
            },
        })

        revalidatePath("/login")

        return {
            success: true,
            message: "Admin account created successfully.",
        };


    } catch (error) {
        console.error("Error creating admin user:", error);
        return {
            success: false,
            message: "Failed to create admin account",
        };
    }

}