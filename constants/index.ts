/* ------------------------- MEDICINE CATEGORIES ------------------------- */
export const MEDICINE_CATEGORIES = [
    { name: "Pain Killers", description: "Pain relief and management medications" },
    { name: "Antibiotics", description: "Medications to treat bacterial infections" },
    { name: "Antivirals", description: "Medications to treat viral infections" },
    { name: "Antifungals", description: "Medications to treat fungal infections" },
    { name: "Antihistamines", description: "Allergy and hypersensitivity medications" },
    { name: "Antacids", description: "Stomach, digestive, and gastrointestinal medications" },
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

export function getDescriptionByCategory(categoryName: string) {
    const category = MEDICINE_CATEGORIES.find((c) => c.name === categoryName);
    return category?.description ?? null;
}

/* ------------------------- MEDICINE UNIT TYPES ------------------------- */
export const MEDICINE_UNIT_GROUPS = [
    {
        label: "Solid Forms",
        units: [
            { value: "tablets", label: "Tablets" },
            { value: "capsules", label: "Capsules" },
            { value: "sachets", label: "Sachets" },
            { value: "lozenges", label: "Lozenges" },
            { value: "suppositories", label: "Suppositories" },
        ],
    },
    {
        label: "Liquid Forms",
        units: [
            { value: "bottles", label: "Bottles (Syrup/Suspension)" },
            { value: "drops", label: "Drops" },
            { value: "ampoules", label: "Ampoules" },
            { value: "vials", label: "Vials" },
        ],
    },
    {
        label: "Semi-Solid Forms",
        units: [
            { value: "creams", label: "Creams" },
            { value: "ointments", label: "Ointments" },
            { value: "gels", label: "Gels" },
            { value: "tubes", label: "Tubes" },
        ],
    },
    {
        label: "Respiratory",
        units: [
            { value: "inhalers", label: "Inhalers" },
            { value: "nebules", label: "Nebules" },
        ],
    },
    {
        label: "Other Forms",
        units: [
            { value: "patches", label: "Patches" },
            { value: "sprays", label: "Sprays" },
            { value: "injections", label: "Injections (Pre-filled)" },
        ],
    },
] as const;


export const MEDICINE_UNIT_VALUES = [
    "tablets",
    "capsules",
    "sachets",
    "lozenges",
    "suppositories",
    "bottles",
    "drops",
    "ampoules",
    "vials",
    "creams",
    "ointments",
    "gels",
    "tubes",
    "inhalers",
    "nebules",
    "patches",
    "sprays",
    "injections",
];

export type MedicineUnit = typeof MEDICINE_UNIT_VALUES[number];

/* ------------------------- MEDICINE WASTAGE REASONS ------------------------- */
export const WASTAGE_REASONS = [
    { value: "expired", label: "Expired" },
    { value: "recalled", label: "Recalled by Manufacturer" },
    { value: "spillage", label: "Spillage" },
    { value: "damage", label: "Damage" },
    { value: "other", label: "Other" },
] as const;

export type WastageReason = (typeof WASTAGE_REASONS)[number]["value"];

export const REASONS_REQUIRING_NOTES: WastageReason[] = ["damage", "other"];


/* ------------------------- TRANSACTIONS TYPES AND UTILITY FUNCTIONS ------------------------- */
export const TRANSACTION_TYPES = [
    { value: "all", label: "All Transactions" },
    { value: "stock_in", label: "Stock In" },
    { value: "dispensed", label: "Dispense" },
    { value: "wastage", label: "Wastage" },
] as const;

export const getTransactionTypeLabel = (type: string) => {
    switch (type) {
        case "stock_in":
            return "Stock In";
        case "dispensed":
            return "Dispense";
        case "wastage":
            return "Wastage";
        default:
            return type;
    }
};

export const getTransactionTypeStyles = (type: string) => {
    switch (type) {
        case "stock_in":
            return "text-medium-jungle bg-medium-jungle/10";
        case "dispensed":
            return "text-princeton-orange bg-princeton-orange/10";
        case "wastage":
            return "text-crimson-red bg-crimson-red/10";
        default:
            return "text-muted-foreground bg-muted";
    }
};

/* ------------------------- MEDICINE AGE GROUPS ------------------------- */
export const AGE_GROUPS = [
    { value: "infant", label: "Infant", description: "< 1 year" },
    { value: "pediatric", label: "Pediatric", description: "1-17 years" },
    { value: "adult", label: "Adult", description: "18-64 years" },
    { value: "geriatric", label: "Geriatric", description: "65+ years" },
    { value: "all_ages", label: "All Ages", description: "Universal" },
] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number]["value"];

export function getAgeGroupLabel(value: string): string {
    const group = AGE_GROUPS.find((g) => g.value === value);
    return group?.label || value;
}

export function getAgeGroupDescription(value: string): string {
    const group = AGE_GROUPS.find((g) => g.value === value);
    return group?.description || "";
}

/* ------------------------- PAYMENT METHODS ------------------------- */
export const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "mpesa", label: "M-Pesa" },
    { value: "card", label: "Card" },
    { value: "insurance", label: "Insurance" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];