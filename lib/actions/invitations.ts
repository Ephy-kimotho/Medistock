"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto";
import { addDays, isAfter } from "date-fns"
import { acceptInvitationSchema } from "@/lib/schemas/users"
import { Prisma } from "@/generated/prisma/client"
import { LIMIT } from "@/lib/utils"
import { requireRole } from "@/lib/check-permissions";
import resend from "../email-client";
import ReminderInviteEmail from "../emails/ReminderInviteEmail"
import InviteEmail from "../emails/InviteUserEmail";
import type { AcceptInvitationInput, GetInvitationProps, Role } from "@/lib/types";

interface AcceptInvitationProps {
    fields: AcceptInvitationInput,
    employeeId: string
}

export async function getInvitations({ page = 1, role, search }: GetInvitationProps) {
    try {
        // Build the where clause
        const where: Prisma.InvitationWhereInput = {
            acceptedAt: null,

            // search filter
            ...(search !== "" && {
                OR: [
                    {
                        request: {
                            name: {
                                contains: search,
                                mode: "insensitive"
                            },
                            email: {
                                contains: search,
                                mode: "insensitive"
                            }
                        }
                    }
                ]
            }),


            // role filter
            ...(role !== "all" && {
                request: {
                    role: role as Role
                }
            })
        }

        const invitations = await prisma.invitation.findMany({
            where,
            include: {
                request: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: LIMIT,
            skip: (page - 1) * LIMIT
        })

        const updatedInvitations = invitations.map((invitation) => {

            const isExpired = isAfter(new Date(), invitation.expiresAt)

            return {
                ...invitation,
                isExpired
            }

        })

        // count invitations
        const totalInvitations = await prisma.invitation.count({
            where
        })

        // calculate total pages
        const totalPages = Math.ceil(totalInvitations / LIMIT);
        const hasNext = page < totalPages
        const hasPrev = page > 1 && page <= totalPages

        return { invitations: updatedInvitations, totalPages, currentPage: page, hasNext, hasPrev }
    } catch (error) {
        throw error
    }

}

export async function createInvitation(requestId: string, invitorId: string) {
    try {
        // Ensure only an admin or HR can send an invitation
        await requireRole(["hr", "admin"]);

        // Get the invitation request
        const invitationRequest = await prisma.invitationRequest.findUnique({
            where: { id: requestId },
            include: {
                requestedBy: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }

        });

        if (!invitationRequest) {
            throw new Error("Invitation request not found!");
        }

        if (invitationRequest.status === "sent") {
            throw new Error("Invitation has already been sent for this request!");
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: invitationRequest.email },
        });

        if (existingUser) {
            throw new Error("A user with this email already exists!");
        }

        // Get the invitor 
        const invitor = await prisma.user.findUnique({
            where: {
                id: invitorId
            },
            select: {
                id: true,
                name: true
            }
        })

        if (!invitor) {
            throw new Error("Invitor not found!");
        }

        // create a unique token
        const inviteToken = randomBytes(32).toString("hex")
        const expiresAt = addDays(new Date(), 7)

        // Build the invite URL
        const inviteURL = `${process.env.NEXT_PUBLIC_APP_URL}/accept?token=${inviteToken}`;

        // send email before creating invitation
        const { error: emailError } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Medistock <noreply@medistock.health>",
            to: invitationRequest.email,
            subject: "You've been invited to join MediStock",
            react: InviteEmail({
                name: invitationRequest.name,
                expiryDate: expiresAt,
                role: invitationRequest.role,
                inviteURL,
                invitor: invitor.name
            })
        })

        if (emailError) {
            console.error("Error sending email:", emailError)
            throw new Error(`Failed to send invitation email: ${emailError.message}`)
        }

        // Create invitation and update request status in a transaction after sending email
        await prisma.$transaction(async (tx) => {
            const invitation = await tx.invitation.create({
                data: {
                    requestId: invitationRequest.id,
                    token: inviteToken,
                    invitedById: invitorId,
                    expiresAt,
                },
            })

            await tx.invitationRequest.update({
                where: {
                    id: requestId
                },
                data: { status: "sent" },
            })

            return invitation
        })

        revalidatePath("/onboarding");
        revalidatePath("/invitations");

        return {
            success: true,
            message: `Invitation sent to ${invitationRequest.email}.`
        }

    } catch (error) {
        throw error
    }
}

export async function acceptInvitation({ fields: { token, name, password }, employeeId }: AcceptInvitationProps) {

    // Validate input
    const validation = acceptInvitationSchema.safeParse({
        name,
        password,
        confirmPassword: password
    })

    if (!validation.success) {
        return {
            success: false,
            message: validation.error.message || "Invalid name or password."
        }
    }

    // Check the token exists 
    const invitation = await prisma.invitation.findUnique({
        where: {
            token
        },
        include: {
            request: {
                select: {
                    email: true,
                    role: true
                }
            }
        }
    })

    if (!invitation) {
        return {
            success: false,
            message: "Invalid invitation token.",
        };
    }

    if (invitation.acceptedAt !== null) {
        return {
            success: false,
            message: "This invitation has already been accepted.",
        };
    }

    // Check the token has not expired
    if (isAfter(new Date(), invitation.expiresAt)) {
        return {
            success: false,
            message: "This invitation has expired.",
        };
    }

    // Check if user already exists 
    const existingUser = await prisma.user.findUnique({
        where: { email: invitation.request.email },
    });

    if (existingUser) {
        return {
            success: false,
            message: "An account with this email already exists.",
        };
    }

    // if user is admin or inventory manager enable email alerts
    const allowEmailNotifications = invitation.request.role === "admin" || invitation.request.role === "inventory_manager"

    // Create the user 
    try {
        const { user } = await auth.api.createUser({
            body: {
                email: invitation.request.email,
                role: invitation.request.role,
                name,
                password,
                data: {
                    emailVerified: true,
                    emailAlertEnabled: allowEmailNotifications,
                    employeeId
                }

            }
        })


        if (!user) {
            return {
                success: false,
                message: "Failed to create account. Please try again.",
            };
        }

        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { acceptedAt: new Date() },
        });


    } catch (error) {
        console.error("Create user error:", error);

        if (error instanceof Error && error.message.includes("already exists")) {
            return {
                success: false,
                message: "An account with this email already exists.",
            };
        }

        return {
            success: false,
            message: "Failed to create account. Please try again.",
        };

    }

    let signInResult = null;

    try {

        signInResult = await auth.api.signInEmail({
            body: {
                email: invitation.request.email,
                password: password,
            }
        })


    } catch (error) {
        console.error("Auto sign-in error:", error);
    }

    if (signInResult !== null && signInResult.user) {
        redirect("/dashboard");
    } else {
        redirect("/login");
    }
}

export async function resendInvite(token: string) {
    try {
        // Ensure only an admin or HR can send an invitation
        await requireRole(["hr", "admin"]);

        // Get the invite from the database
        const invitation = await prisma.invitation.findUnique({
            where: {
                token
            },
            include: {
                invitedBy: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                request: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        })

        if (!invitation) {
            throw new Error("Invitation not found!")
        }

        if (invitation.acceptedAt !== null) {
            throw new Error("This invitation has already been accepted!")
        }

        // Get the user who has invited the new user
        const invitor = await prisma.user.findUnique({
            where: {
                id: invitation.invitedById
            }
        })

        if (!invitor) {
            throw new Error("Invitor not found!")
        }

        // Add expiration time
        const inviteToken = invitation.token;
        const expiresAt = addDays(new Date(), 7)

        // Build the invite URL
        const inviteURL = `${process.env.NEXT_PUBLIC_APP_URL}/accept?token=${inviteToken}`;

        // Resend the email
        const { error: emailError } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Medistock <noreply@medistock.health>",
            to: invitation.request.email,
            subject: "Reminder - You've been invited to join MediStock",
            react: ReminderInviteEmail({
                name: invitation.request.name,
                expiryDate: expiresAt,
                role: invitation.request.role,
                inviteURL,
                invitor: invitor.name
            })
        })

        if (emailError) {
            console.error("Error sending email:", emailError)
            throw new Error(`Failed to send invitation email: ${emailError.message}`)
        }

        // Update the invite expiration
        await prisma.invitation.update({
            where: {
                id: invitation.id,
                token: invitation.token
            },
            data: {
                expiresAt
            }

        })

        revalidatePath("/onboarding");
        revalidatePath("/invitations");

        return {
            success: true,
            message: `Invitation resent to ${invitation.request.email}.`,
        }

    } catch (error) {
        throw error
    }

}

