// This file has all application interfaces and types

export type Role = "user" | "admin" | "auditor" | "inventory_manager"

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