"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { addDays, isAfter } from "date-fns"
import { acceptInvitationSchema } from "@/lib/schemas/users"
import resend from "../email-client";
import ReminderInviteEmail from "../emails/ReminderInviteEmail"
import InviteEmail from "../emails/InviteUserEmail";
import type { InviteUserInput, AcceptInvitationInput } from "@/lib/types";


export async function getInvitations() {
    try {
        const invitations = await prisma.invitation.findMany({
            where: {
                acceptedAt: null
            }
        })

        const updatedInvitations = invitations.map((invitation) => {

            const isExpired = isAfter(new Date(), invitation.expiresAt)

            return {
                ...invitation,
                isExpired
            }

        })

        return updatedInvitations
    } catch (error) {
        throw error
    }

}

export async function createInvitation({ name, email, role, invitedById }: InviteUserInput) {
    try {
        // Check if a user with email already exists 
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            throw new Error("A user with this email already exists.")
        }

        // Check if an invitation has already been sent
        const existingInvitation = await prisma.invitation.findUnique({
            where: { email }
        })

        if (existingInvitation) {
            if (existingInvitation.acceptedAt === null) {
                throw new Error("An invitation has already been sent.")
            } else {
                throw new Error("This invitation has already been accepted.")
            }
        }

        // Get the user who has invited the new user
        const invitor = await prisma.user.findUnique({
            where: {
                id: invitedById
            }
        })

        if (!invitor) {
            throw new Error("Invitor not found.")
        }

        // create a unique token
        const inviteToken = randomBytes(32).toString("hex")
        const expiresAt = addDays(new Date(), 7)

        // Build the invite URL
        const inviteURL = `${process.env.NEXT_PUBLIC_APP_URL}/accept?token=${inviteToken}`;

        // send email before creating invitation
        const { error: emailError } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Medistock <noreply@medistock.health>",
            to: email,
            subject: "You've been invited to join MediStock",
            react: InviteEmail({
                name,
                expiryDate: expiresAt,
                role,
                inviteURL,
                invitor: invitor.name
            })
        })


        if (emailError) {
            console.error("Error sending email:", emailError)
            throw new Error(`Failed to send invitation email: ${emailError.message}`)
        }

        // create the invitation after email has been sent successfully
        await prisma.invitation.create({
            data: {
                name,
                email,
                role,
                token: inviteToken,
                expiresAt,
                invitedById
            }
        })

        return {
            success: true,
            message: `Invitation sent to ${email}.`
        }

    } catch (error) {
        throw error
    }
}

export async function acceptInvitation({ token, name, password }: AcceptInvitationInput) {

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
        where: { email: invitation.email },
    });

    if (existingUser) {
        return {
            success: false,
            message: "An account with this email already exists.",
        };
    }

    // Create the user 
    try {
        console.log("Creating user......")

        const { user } = await auth.api.createUser({
            body: {
                email: invitation.email,
                role: invitation.role,
                name,
                password,
                data: {
                    emailVerified: true,
                }

            }
        })

        console.log("Created user result:", user)

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
        console.log("Auto log-in attempt......")

        signInResult = await auth.api.signInEmail({
            body: {
                email: invitation.email,
                password: password,
            }
        })

        console.log("Auto log-in result:", signInResult)
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
        // Get the invite from the database
        const invitation = await prisma.invitation.findUnique({
            where: {
                token
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

        // Update the invite expiration
        const updatedInvitation = await prisma.invitation.update({
            where: {
                id: invitation.id,
                token: invitation.token
            },
            data: {
                expiresAt
            }

        })

        // Build the invite URL
        const inviteURL = `${process.env.NEXT_PUBLIC_APP_URL}/accept?token=${inviteToken}`;

        // Send the email
        console.log("Trying to resend invite")
        const { error: emailError } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Medistock <noreply@medistock.health>",
            to: invitation.email,
            subject: "Reminder - You've been invited to join MediStock",
            react: ReminderInviteEmail({
                name: invitation.name,
                expiryDate: expiresAt,
                role: invitation.role,
                inviteURL,
                invitor: invitor.name
            })
        })

        if (emailError) {
            console.error("Error sending email:", emailError)
            throw new Error(`Failed to send invitation email: ${emailError.message}`)
        }

        console.log("Resend invite successfull.")
        return {
            success: true,
            message: "Invitation resent successfully",
            invitation: updatedInvitation
        }

    } catch (error) {
        throw error
    }

}

