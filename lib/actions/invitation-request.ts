"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/check-permissions";
import { LIMIT, formatRole } from "@/lib/utils";
import resend from "@/lib/email-client"
import NewEmployeeRequestEmail from "../emails/NewEmployeeRequestEmail";
import type { InvitationRequestInput, } from "@/lib/schemas/invitation-request";
import type { NotifyAdminsParams } from "@/lib/types"


export async function getInvitationRequests({
    page = 1,
    search = "",
    email
}: {
    page: number;
    search: string;
    email: string
}) {
    try {
        await requireRole(["hr", "admin"])

        const where: Prisma.InvitationRequestWhereInput = {
            email: {
                not: email
            },

            ...(search !== "" && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                    { employeeId: { contains: search, mode: "insensitive" } },
                ],
            }),

        };

        const requests = await prisma.invitationRequest.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            take: LIMIT,
            skip: (page - 1) * LIMIT,
        });

        const totalRequests = await prisma.invitationRequest.count({ where });

        const totalPages = Math.ceil(totalRequests / LIMIT);
        const hasNext = page < totalPages;
        const hasPrev = page > 1 && page <= totalPages;

        return {
            requests,
            totalPages,
            currentPage: page,
            hasNext,
            hasPrev,
        };
    } catch (error) {
        console.error("Error getting invitation requests:", error);
        throw error;
    }
}

async function notifyAdminsOfNewRequest({
    employeeName,
    employeeEmail,
    employeeRole,
    employeeId,
    requestedByName,
}: NotifyAdminsParams) {
    try {
        // Get the admins to notify.
        const admins = await prisma.user.findMany({
            where: {
                role: "admin",
                banned: false,
            },
            select: {
                name: true,
                email: true,
            },
            take: 40
        });

        // Check admin count.
        if (admins.length === 0) {
            console.log("No admins found to notify");
            return { success: true, notified: 0 };
        }

        // Build the onboarding URL.
        const onboardingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`;

        // create email promises.
        const emailPromises = admins.map((admin) => {
            return resend.emails.send({
                from: process.env.EMAIL_FROM || "Medistock <noreply@medistock.health>",
                to: admin.email,
                subject: `New Employee Request ${employeeName}`,
                react: NewEmployeeRequestEmail({
                    adminName: admin.name,
                    employeeName,
                    employeeEmail,
                    employeeRole: formatRole(employeeRole),
                    employeeId,
                    requestedBy: requestedByName,
                    onboardingUrl,
                }),
            })

        })

        // Execute the promises
        const results = await Promise.allSettled(emailPromises);

        // Get the success count
        const successCount = results.filter(
            (result) => result.status === "fulfilled"
        ).length;

        // Log emails that failed 
        results.forEach((result, index) => {
            if (result.status === "rejected") {
                console.error(
                    `Failed to notify admin ${admins[index].email}:`,
                    result.reason
                );
            }
        });

        return { success: true, notified: successCount };

    } catch (error) {
        console.error("Error notifying admins:", error);
        return { success: false, notified: 0 };
    }
}

export async function createInvitationRequest(data: InvitationRequestInput, requestorId: string) {
    try {
        await requireRole(["hr"]);

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return { success: false, message: "A user with this email already exists" };
        }

        const existingRequest = await prisma.invitationRequest.findUnique({
            where: { email: data.email },
        });

        if (existingRequest) {
            return { success: false, message: "An invitation request for this email already exists" };
        }

        const requestor = await prisma.user.findUnique({
            where: { id: requestorId },
            select: { name: true },
        });

        if (!requestor) {
            return { success: false, message: "Requestor not found!" };
        }

        await prisma.invitationRequest.create({
            data: {
                name: data.name,
                email: data.email,
                role: data.role,
                phone: data.phone,
                employeeId: data.employeeId,
                requestedById: requestorId,
                status: "pending",
            },
        });

        const notificationResult = await notifyAdminsOfNewRequest({
            employeeName: data.name,
            employeeEmail: data.email,
            employeeRole: data.role,
            employeeId: data.employeeId,
            requestedByName: requestor.name,
        });

        if (notificationResult.notified > 0) {
            console.log(
                `Notified ${notificationResult.notified} admin(s) about new employee request`
            );
        }

        revalidatePath("/onboarding");

        return {
            success: true,
            message: `Request created and notified ${notificationResult.notified} ${notificationResult.notified > 1 ? "admins" : "admin"}`,
        };
    } catch (error) {
        console.error("Error creating invitation request:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to create invitation request",
        };
    }
}