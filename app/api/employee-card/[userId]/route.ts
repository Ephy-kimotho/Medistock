import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/check-permissions"
import { prisma } from "@/lib/prisma"
import { generateEmployeeCard } from "@/lib/services/pdf-service"
import type { Role } from "@/lib/types"


export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const session = await getServerSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { userId } = await params

        // Users can only download their own card (admins can download any)
        const isAdmin = session.user.role === "admin";
        const isOwnCard = session.user.id === userId;

        if (!isAdmin && !isOwnCard) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }


        // Fetch user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                role: true,
                employeeId: true,
                image: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.employeeId) {
            return NextResponse.json(
                { error: "User does not have an employee ID" },
                { status: 400 }
            );
        }

        // Get facility information
        const settings = await prisma.settings.findFirst({
            select: { facilityName: true },
        });

        const facilityName = settings?.facilityName || "MediStock";

        // Fetch Image if it exists
        let imageBuffer: Buffer | null = null;

        if (user.image) {
            try {
                const imageResponse = await fetch(user.image);
                if (imageResponse.ok) {
                    const arrayBuffer = await imageResponse.arrayBuffer();
                    imageBuffer = Buffer.from(arrayBuffer);
                }
            } catch (error) {
                console.error("Failed to fetch user image:", error);
                // Continue without image
            }
        }

        // Generate the PDF
        const pdfBuffer = await generateEmployeeCard({
            name: user.name,
            role: user.role as Role,
            employeeId: user.employeeId,
            facilityName,
            imageBuffer,
        });

        const filename = `employee-card-${user.employeeId}.pdf`;

        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": pdfBuffer.length.toString(),
            },
        });


    } catch (error) {
        console.error("Error generating employee card:", error);
        return NextResponse.json(
            { error: "Failed to generate employee card" },
            { status: 500 })
    }
}