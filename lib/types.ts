import { ComponentType } from "react"
import { getApplicationUsers } from "@/lib/actions/users"
import { getInvitations } from "@/lib/actions/invitations"
import { getInvitationRequests } from "@/lib/actions/invitation-request"
import { getCategories } from "@/lib/actions/categories"
import { getCategoryNames } from "@/lib/actions/medicines"

// ==================== TYPE DEFINITIONS ====================
export type Role = "user" | "admin" | "auditor" | "inventory_manager" | "hr"
export type RoleWithoutHR = "user" | "admin" | "auditor" | "inventory_manager";
export type Invitations = NonNullable<Awaited<ReturnType<typeof getInvitations>>>["invitations"]
export type InvitationRequest = NonNullable<Awaited<ReturnType<typeof getInvitationRequests>>>["requests"][number]
export type User = NonNullable<Awaited<ReturnType<typeof getApplicationUsers>>>["users"][number]
export type Category = NonNullable<Awaited<ReturnType<typeof getCategories>>>["categories"][number]
export type CategoryInfo = NonNullable<Awaited<ReturnType<typeof getCategoryNames>>>



export type StockStatus = "all" | "in_stock" | "low_stock" | "out_of_stock";
export type StockExpiryStatus = "all" | "good" | "expiring_soon" | "expired";

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

export type TransactionType = "all" | "stock_in" | "dispensed" | "wastage" | "adjustment";
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
    password: string,
    image?: string
}

export interface StatCardProps {
    title: string;
    metric: string | number;
    Icon: ComponentType<{ className?: string }>,
    details?: string
    theme?: string
}

export interface MedicineInput {
    name: string;
    unit: string;
    reorderlevel: number;
    categoryId: string;
    manufacturer?: string;
}

export interface MedicineWithStock {
    id: string;
    name: string;
    unit: string;
    reorderlevel: number;
    categoryId: string;
    categoryName: string;
    manufacturer: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    totalStock: number;
    stockStatus: "in_stock" | "low_stock" | "out_of_stock";
}

export interface GetMedicinesParams {
    page: number;
    search: string;
    categoryId: string;
    status: StockStatus;
}

export interface StockInput {
    medicineId: string;
    batchNumber: string;
    quantity: number;
    initialtQuantity: number;
    expiryDate: string | Date;
    purchaseDate: string | Date;
    purchasePrice: number;
    supplier?: string | null | undefined;
    notes?: string | null | undefined;
}

export interface StockWithMedicine {
    id: string;
    medicineId: string;
    medicineName: string;
    batchNumber: string;
    quantity: number;
    initialQuantity: number;
    expiryDate: Date;
    purchaseDate: Date;
    purchasePrice: number;
    supplier: string | null;
    notes: string | null;
    stockStatus: StockExpiryStatus;
}

export interface MedicineName {
    id: string;
    name: string;
}

export interface BatchInfo {
    id: string;
    batchNumber: string;
    quantity: number;
    expiryDate: Date;
}

export interface DispenseInput {
    stockEntriesId: string;
    quantity: number;
    patient: string;
    phone: string;
    notes?: string | null;
}

export interface WastageInput {
    stockEntriesId: string;
    quantity: number;
    reason: string;
    notes?: string | null | undefined;
}

export interface TransactionWithDetails {
    id: string;
    date: Date;
    type: "stock_in" | "dispensed" | "wastage" | "adjustment";
    medicineName: string;
    quantity: number;
    batchNumber: string;
    userName: string;
    userRole: string;
    patient: string | null;
    phone: string | null;
    reason: string;
}

export interface TransactionFilters {
    page?: number;
    search?: string;
    type?: string;
    medicineId?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
}

export interface UserInfo {
    id: string;
    name: string;
}

export interface RecentTransactionAdmin {
    id: string;
    medicineName: string;
    userName: string;
    quantity: number;
    type: "stock_in" | "dispensed" | "wastage";
    createdAt: Date;
}

export interface RecentTransactionStaff {
    id: string;
    medicineName: string;
    quantity: number;
    patient: string | null;
    phone: string | null;
    createdAt: Date;
}

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
}

export interface ImageUploadResult {
    success: boolean;
    url?: string;
    error?: string;
    filename?: string;
}

export interface ImageServiceConfig {
    bucket: string;
    maxSizeMB: number;
    compressionThresholdMB: number;
    allowedTypes: string[];
    folder?: string;
}


export interface EmployeeCardData {
    name: string,
    role: Role,
    employeeId: string,
    facilityName: string,
    imageBuffer: Buffer | null,
}
