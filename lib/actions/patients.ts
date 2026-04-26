"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/check-permissions";
import { redirect } from "next/navigation";
import type { MEDICINE_AGE_GROUP } from "@/generated/prisma/client";

// Search patients by name or phone, optionally filtered by age group
export async function searchPatients(
  search: string,
  ageGroup?: MEDICINE_AGE_GROUP
) {
  try {
    const session = await getServerSession();

    if (!session) {
      redirect("/login");
    }

    if (!search || search.length < 2) {
      return [];
    }

    // Build where clause based on age group filter
    const ageGroupFilter =
      ageGroup && ageGroup !== "all_ages" ? { ageGroup } : {};

    const patients = await prisma.patient.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          },
          ageGroupFilter,
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        ageGroup: true,
      },
      orderBy: { name: "asc" },
      take: 10,
    });

    return patients;
  } catch (error) {
    console.error("Failed to search patients:", error);
    return [];
  }
}

// Get patient by phone (for duplicate check)
export async function getPatientByPhone(
  phone: string
) {
  try {
    const session = await getServerSession();

    if (!session) {
      redirect("/login");
    }

    const patient = await prisma.patient.findUnique({
      where: { phone },
      select: {
        id: true,
        name: true,
        phone: true,
        ageGroup: true,
      },
    });

    return patient;
  } catch (error) {
    console.error("Failed to get patient by phone:", error);
    return null;
  }
}

// Get all patients, optionally filtered by age group
export async function getPatients(
  ageGroup?: MEDICINE_AGE_GROUP
){
  try {
    const session = await getServerSession();

    if (!session) {
      redirect("/login");
    }

    // Build where clause - if ageGroup is "all_ages" or undefined, show all patients
    const whereClause =
      ageGroup && ageGroup !== "all_ages" ? { ageGroup } : {};

    const patients = await prisma.patient.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        phone: true,
        ageGroup: true,
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    return patients;
  } catch (error) {
    console.error("Failed to get patients:", error);
    return [];
  }
}

