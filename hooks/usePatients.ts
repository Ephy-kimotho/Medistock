"use client";

import { useQuery } from "@tanstack/react-query";
import {
  searchPatients,
  getPatients,
  getPatientByPhone,
} from "@/lib/actions/patients";
import type { MEDICINE_AGE_GROUP } from "@/generated/prisma/client";

export const PatientKeys = {
  all: ["patients"] as const,
  list: (ageGroup?: MEDICINE_AGE_GROUP) =>
    ["patients", "list", ageGroup ?? "all"] as const,
  search: (query: string, ageGroup?: MEDICINE_AGE_GROUP) =>
    ["patients", "search", query, ageGroup ?? "all"] as const,
  byPhone: (phone: string) => ["patients", "phone", phone] as const,
};

export function usePatients(ageGroup?: MEDICINE_AGE_GROUP) {
  return useQuery({
    queryKey: PatientKeys.list(ageGroup),
    queryFn: () => getPatients(ageGroup),
  });
}

export function useSearchPatients(
  search: string,
  ageGroup?: MEDICINE_AGE_GROUP
) {
  return useQuery({
    queryKey: PatientKeys.search(search, ageGroup),
    queryFn: () => searchPatients(search, ageGroup),
    enabled: search.length >= 2,
  });
}

export function usePatientByPhone(phone: string) {
  return useQuery({
    queryKey: PatientKeys.byPhone(phone),
    queryFn: () => getPatientByPhone(phone),
    enabled: phone.length >= 7,
  });
}