
export const MEDICINE_CATEGORIES = [
    { name: "Analgesics", description: "Pain relief and management medications" },
    { name: "Antibiotics", description: "Medications to treat bacterial infections" },
    { name: "Antivirals", description: "Medications to treat viral infections" },
    { name: "Antifungals", description: "Medications to treat fungal infections" },
    { name: "Antihistamines", description: "Allergy and hypersensitivity medications" },
    { name: "Antacids & GI", description: "Stomach, digestive, and gastrointestinal medications" },
    { name: "Cardiovascular", description: "Heart, blood pressure, and circulation medications" },
    { name: "Respiratory", description: "Asthma, COPD, cough, and bronchial medications" },
    { name: "Dermatological", description: "Skin treatments, creams, and ointments" },
    { name: "Endocrine & Hormonal", description: "Diabetes, thyroid, and hormone therapies" },
    { name: "Neurological", description: "Brain and nervous system medications" },
    { name: "Psychiatric", description: "Antidepressants, anxiolytics, and mental health medications" },
    { name: "Musculoskeletal", description: "Muscle relaxants and arthritis medications" },
    { name: "Ophthalmic", description: "Eye drops, ointments, and vision medications" },
    { name: "Otic", description: "Ear drops and ear infection treatments" },
    { name: "Vitamins & Supplements", description: "Nutritional and dietary supplements" },
    { name: "Vaccines & Immunizations", description: "Preventive vaccines and immunizations" },
    { name: "Contraceptives", description: "Birth control and reproductive health medications" },
    { name: "Antiseptics & Disinfectants", description: "Wound care and sterilization products" },
    { name: "Emergency & Critical Care", description: "Epinephrine, resuscitation, and emergency medications" },
] as const;

export const AGE_GROUPS = [
    { value: "all_ages", label: "All Ages" },
    { value: "adult", label: "Adult" },
    { value: "pediatric", label: "Pediatric" },
] as const;

export type AgeGroup = typeof AGE_GROUPS[number]["value"];

export function getDescriptionByCategory(categoryName: string) {
    const category = MEDICINE_CATEGORIES.find((c) => c.name === categoryName);
    return category?.description ?? null;
}