"use server"

import { revalidatePath } from "next/cache"
import { auth } from "../auth"
import { prisma } from "../prisma"
import type { SetupSchema } from "../schemas/setup"

export async function createHRUser({ name, email, password }: SetupSchema) {
    try {
        // Ensure that there are no users in the system before creating HR
        const userCount = await prisma.user.count()

        console.log("Checking user count...")

        if (userCount > 0) {
            return {
                success: false,
                message: "HR account already exists. Setup is only allowed for the first user.",
            };
        }
        // Create the first admin user
        await auth.api.createUser({
            body: {
                name,
                email,
                password,
                role: "hr",
                data: {
                    emailVerified: true,
                },
            },
        })

        console.log("Revalidating login page...")
        revalidatePath("/login")

        return {
            success: true,
            message: "HR account created successfully.",
        };


    } catch (error) {
        console.error("Error creating admin user:", error);
        return {
            success: false,
            message: "Failed to create HR account",
        };
    }

}