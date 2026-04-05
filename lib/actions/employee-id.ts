"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";

const EMPLOYEE_ID_PREFIX = "EMP";
const EMPLOYEE_ID_PAD_LENGTH = 4;

export async function getNextEmployeeId(): Promise<string> {
  try {
    const session = await getServerSession();

    if (!session) {
      redirect("/login");
    }

    // Get the highest employee ID from both InvitationRequest and User tables
    const [latestRequest, latestUser] = await Promise.all([
      prisma.invitationRequest.findFirst({
        where: {
          employeeId: {
            startsWith: EMPLOYEE_ID_PREFIX,
          },
        },
        orderBy: {
          employeeId: "desc",
        },
        select: {
          employeeId: true,
        },
      }),

      prisma.user.findFirst({
        where: {
          employeeId: {
            startsWith: EMPLOYEE_ID_PREFIX,
          },
        },
        orderBy: {
          employeeId: "desc",
        },
        select: {
          employeeId: true,
        },
      }),
    ]);

    // Extract numbers from both employee IDs
    const extractNumber = (employeeId: string | null | undefined) => {
      if (!employeeId) return 0;

      const match = employeeId.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const requestNumber = extractNumber(latestRequest?.employeeId);
    const userNumber = extractNumber(latestUser?.employeeId);

    // Get the highest number and increment
    const nextNumber = Math.max(requestNumber, userNumber) + 1;

    // Format with padding (e.g., EMP-0001)
    const paddedNumber = nextNumber
      .toString()
      .padStart(EMPLOYEE_ID_PAD_LENGTH, "0");

    return `${EMPLOYEE_ID_PREFIX}-${paddedNumber}`;
  } catch (error) {
    console.error("Error generating employee ID: ", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate employee ID");
  }
}