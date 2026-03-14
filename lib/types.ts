import { ComponentType } from "react"
import { getApplicationUsers } from "@/lib/actions/users"
import { getInvitations } from "@/lib/actions/invitations"
import { getInvitationRequests } from "@/lib/actions/invitation-request"
import { getCategories } from "@/lib/actions/categories"

// ==================== TYPE DEFINITIONS ====================
export type Role = "user" | "admin" | "auditor" | "inventory_manager" | "hr"
export type RoleWithoutHR = "user" | "admin" | "auditor" | "inventory_manager";
export type Invitations = NonNullable<Awaited<ReturnType<typeof getInvitations>>>["invitations"]
export type InvitationRequest = NonNullable<Awaited<ReturnType<typeof getInvitationRequests>>>["requests"][number]
export type User = NonNullable<Awaited<ReturnType<typeof getApplicationUsers>>>["users"][number]
export type Category = NonNullable<Awaited<ReturnType<typeof getCategories>>>["categories"][number]

export type Settings = {
    facilityName: string;
    facilityAddress: string;
    expiryWarnDays: number;
    criticalExpiryWarnDays: number;
}

export type CreateCategory = {
    name: string,
    description?: string
}

export type UpdateCategory = Partial<CreateCategory>

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

export interface NotifyAdminsParams {
    employeeName: string;
    employeeEmail: string;
    employeeRole: string;
    employeeId: string;
    requestedByName: string;
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