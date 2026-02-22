import { addMinutes } from "date-fns"
import resend from "@/lib/email-client";
import ResetPasswordEmail from "@/lib/emails/ResetPasswordEmail";

interface ResetPasswordEmailProps {
    name: string;
    resetURL: string;
    email: string;
}

export async function sendPasswordResetLinkEmail({ email, resetURL, name = "there" }: ResetPasswordEmailProps) {

    const expiresAt = addMinutes(new Date(), 15)

    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM || "Medistock <noreply@medistock.health>",
            to: email,
            subject: "Reset your MediStock password",
            react: ResetPasswordEmail({
                name,
                expiresAt,
                resetURL
            })
        })
    } catch (error) {
        throw error
    }


}