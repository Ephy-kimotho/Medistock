import { ComponentType } from "react"
import { getApplicationUsers } from "@/lib/actions/users"
import { getInvitations } from "@/lib/actions/invitations"

// ==================== TYPE DEFINITIONS ====================
export type Role = "user" | "admin" | "auditor" | "inventory_manager"
export type Invitations = NonNullable<Awaited<ReturnType<typeof getInvitations>>>
export type User = NonNullable<Awaited<ReturnType<typeof getApplicationUsers>>>[number]

// ==================== INTERFACES ====================
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