"use server"

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { addMinutes } from "date-fns"
import { isAfter } from "date-fns"
import resend from "../email-client";
import InviteEmail from "../emails/InviteUserEmail";
import type { InviteUserInput } from "@/lib/types";


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
        const expiresAt = addMinutes(new Date(), 5)

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


export async function validateToken(token: string) {

    // Get the invitation with this token
    const invitation = await prisma.invitation.findUnique({
        where: {
            token
        }
    })

    if (!invitation) {
        return {
            success: false,
            message: "Invitation not found."
        }
    }

    // Check if the invitation has already been accepted
    if (invitation && invitation.acceptedAt !== null) {
        return {
            success: false,
            message: "This invitation has already been used."
        }
    }

    // Check if the token has expired
    const hasExpired = isAfter(new Date(), invitation.expiresAt)

    if (hasExpired) {
        return {
            success: false,
            message: "This invitation has already expired."
        }
    }

    return {
        success: true,
        message: "Valid invitation"
    }
}