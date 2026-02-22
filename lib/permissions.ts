import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
    ...defaultStatements,
    medicine: ["create", "read", "update", "soft-delete", "hard-delete", "transact"],
    category: ["create", "read", "update", "delete"],
    stockEntry: ["create", "read", "update", "delete"],
    report: ["create", "read", "delete"]
} as const;

export const ac = createAccessControl(statement);

/**
 * user role defintions and ther permission scope
 */

export const user = ac.newRole({
    user: ["set-password", "get"],
    medicine: ["read", "transact"],
    category: ["read"],
    stockEntry: ["read"],
})

export const inventory_manager = ac.newRole({
    user: ["set-password", "get"],
    medicine: ["create", "read", "update", "soft-delete", "transact"],
    category: ["create", "read", "update"],
    stockEntry: ["create", "read", "update",],
    report: ["create", "read"]
})

export const auditor = ac.newRole({
    user: ["set-password", "get"],
    medicine: ["read"],
    category: ["read",],
    stockEntry: ["read",],
    report: ["create", "read"]
})


export const admin = ac.newRole({
    ...adminAc.statements,
    medicine: ["create", "read", "update", "soft-delete", "hard-delete", "transact"],
    category: ["create", "read", "update", "delete"],
    stockEntry: ["create", "read", "update", "delete"],
    report: ["create", "read", "delete"]
})


