"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/check-permissions"
import type { Settings } from "@/lib/types"


export async function getApplicationSettings() {
    try {
        await requireRole(["admin"])
        const settings = await prisma.settings.findFirst()

        return settings

    } catch (error) {
        throw error
    }
}

export async function setApplicationSettings({ values }: { values: Settings }) {
    try {

        const settings = await prisma.settings.findFirst()

        if (!settings || settings === null) {
            return await prisma.settings.create({
                data: {
                    ...values
                }
            })
        }

        return await prisma.settings.update({
            where: {
                id: settings.id
            }, data: {
                ...values
            }
        })



    } catch (error) {
        console.error("Error creating or updating settings: ", error)
        throw error

    }


}