"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@/generated/prisma/client"
import { requireRole, getServerSession } from "@/lib/check-permissions"
import { LIMIT } from "@/lib/utils"
import { redirect } from "next/navigation"

type CreateCategoryData = Prisma.CategoryCreateInput
type UpdateCategoryData = Prisma.CategoryUpdateInput

export async function createCategory(data: CreateCategoryData) {
    try {

        await requireRole(["admin", "inventory_manager"])

        const category = await prisma.category.create({
            data
        })

        revalidatePath("/inventory/categories")

        return {
            success: true,
            message: `${category.name} category created successfully.`,
            category
        }
    } catch (error) {
        console.error("Error creating category: ", error);
        throw error
    }

}

export async function getCategories({
    page = 1,
    search = "",
}: {
    page: number;
    search: string;
}) {
    try {
        const session = await getServerSession()

        if (!session) {
            redirect("/login")
        }

        const userRole = session.user.role;
        const canViewArchived = userRole === "admin" || userRole === "inventory_manager";

        const where: Prisma.CategoryWhereInput = {
            ...(!canViewArchived && { deletedAt: null }),
            ...(search !== "" && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ],
            }),
        };

        const categories = await prisma.category.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            take: LIMIT,
            skip: (page - 1) * LIMIT,
            include: {
                medicines: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        stockEntries: {
                            select: {
                                quantity: true,
                            },
                        },
                    },
                },
            },
        });

        const totalCategories = await prisma.category.count({ where });

        const totalPages = Math.ceil(totalCategories / LIMIT);
        const hasNext = page < totalPages;
        const hasPrev = page > 1 && page <= totalPages;

        // Transform and calculate totals
        const formattedCategories = categories.map((category) => {
            const medicineCount = category.medicines.length;

            const totalStock = category.medicines.reduce((sum, medicine) => {

                const medicineStock = medicine.stockEntries.reduce(
                    (entrySum, entry) => entrySum + entry.quantity,
                    0
                );
                return sum + medicineStock;
            }, 0);

            return {
                id: category.id,
                name: category.name,
                description: category.description,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
                deletedAt: category.deletedAt,
                isArchived: category.deletedAt !== null,
                medicineCount,
                totalStock,
            };
        });

        return {
            categories: formattedCategories,
            totalPages,
            currentPage: page,
            hasNext,
            hasPrev,
            canViewArchived
        };
    } catch (error) {
        console.error("Error getting categories: ", error);
        throw error;
    }
}

export async function updateCategory(values: UpdateCategoryData, categoryId: string) {
    try {
        const updatedCategory = await prisma.category.update({
            where: {
                id: categoryId
            },
            data: values
        })


        return {
            success: true,
            message: `${updatedCategory.name} category updated successfully.`,
            category: updatedCategory
        }
    } catch (error) {
        console.error("error updating category:", error);
        throw error;

    }

}

export async function archiveCategory(categoryId: string) {
    try {

        const session = await getServerSession();

        if (!session) {
            throw new Error("Unauthorized");
        }

        await requireRole(["admin", "inventory_manager"])

        const archivedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: { deletedAt: new Date() },
        });

        return { success: true, message: `${archivedCategory.name} category archived successfully` };
    } catch (error) {
        console.error("Error archiving category:", error);
        throw new Error("Failed to archive category");
    }
}

export async function restoreCategory(categoryId: string) {
    try {
        const session = await getServerSession();

        if (!session) {
            throw new Error("Unauthorized");
        }

        await requireRole(["admin", "inventory_manager"])

        const restoredCategory = await prisma.category.update({
            where: { id: categoryId },
            data: { deletedAt: null },
        });

        return { success: true, message: `${restoredCategory.name} category restored successfully` };
    } catch (error) {
        console.error("Error restoring category:", error);
        throw new Error("Failed to restore category");
    }
}