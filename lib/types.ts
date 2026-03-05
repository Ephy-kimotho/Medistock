import { ComponentType } from "react"
import { getApplicationUsers } from "@/lib/actions/users"
import { getInvitations } from "@/lib/actions/invitations"

// ==================== TYPE DEFINITIONS ====================
export type Role = "user" | "admin" | "auditor" | "inventory_manager"
export type Invitations = NonNullable<Awaited<ReturnType<typeof getInvitations>>>["invitations"]
export type User = NonNullable<Awaited<ReturnType<typeof getApplicationUsers>>>["users"][number]
export type Settings = {
    facilityName: string;
    facilityAddress: string;
    expiryWarnDays: number;
    criticalExpiryWarnDays: number;
}

// ==================== INTERFACES ====================
export interface GetUsersProps {
    page: number,
    search: string,
    role: string
}

export interface GetInvitationProps {
    page: number,
    search: string,
    role: string
}

export interface BanUserInfo {
    userId: string,
    banReason?: string,
    banExpiresIn?: number
}

export interface InviteUserInput {
    name: string;
    role: Role;
    email: string;
    invitedById: string;
}

export interface AcceptInvitationInput {
    token: string,
    name: string,
    password: string
}

export interface StatCardProps {
    title: string;
    metric: string | number;
    Icon: ComponentType<{ className?: string }>,
    details?: string
    theme?: string
}