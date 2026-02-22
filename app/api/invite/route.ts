import { NextRequest, NextResponse } from "next/server"
import { createInvitation } from "@/lib/actions/invitations"
import { userInvitationSchema } from "@/lib/schemas/users"
import z from "zod"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const { email, invitedById, name, role } = userInvitationSchema.parse(body);

        const invitation = await createInvitation({ email, role, invitedById, name });

        return NextResponse.json(invitation)

    } catch (error) {

        console.error("Invitation error:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(error, {
                status: 400
            })

        }

        if (error instanceof Error && error.message.includes("A user with this email already exists.")) {
            return NextResponse.json({
                success: false,
                message: error.message
            }, { status: 400 })
        }

        if (error instanceof Error && error.message.includes("An invitation has already been sent.")) {
            return NextResponse.json({
                success: false,
                message: error.message
            }, { status: 400 })
        }

        if (error instanceof Error && error.message.includes("This invitation has already been accepted.")) {
            return NextResponse.json({
                success: false,
                message: error.message
            }, { status: 400 })
        }

        if (error instanceof Error && error.message.includes("Invitor not found.")) {
            return NextResponse.json({
                success: false,
                message: error.message
            }, { status: 400 })
        }

        if (error instanceof Error && error.message.includes("Failed to send invitation email:")) {
            return NextResponse.json({
                success: false,
                message: error.message
            }, { status: 400 })
        }

        return NextResponse.json({
            success: false,
            message: "An unknown error occured."
        }, {
            status: 500
        })
    }
}