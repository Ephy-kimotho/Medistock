import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getServerSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    return session
}


export async function checkServerPermission(resource: string, action: string) {
    const session = await getServerSession()
    const userId = session?.user?.id

    if (!userId) {
        return false
    }

    try {
        const { success } = await auth.api.userHasPermission({
            body: {
                permissions: {
                    [resource]: [action],
                },
            }
        })

        return success ?? false
    } catch {
        return false
    }

}



export async function requirePermission(resource: string, action: string) {
    
    const hasPermission = await checkServerPermission(resource, action)

    if (!hasPermission) {
        throw new Error("Unauthorized: insufficient permissions!")
    }

}
