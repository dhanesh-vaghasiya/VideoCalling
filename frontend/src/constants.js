/* ── App Constants ── */

export const CONSULTATION_TYPES = [
  { value: "general", label: "General Consultation", desc: "Mild fever, cough, cold, body ache" },
  { value: "followup", label: "Follow-up Visit", desc: "Revisit for ongoing treatment" },
  { value: "specialist", label: "Specialist Consultation", desc: "Heart, bone, skin, or organ-specific issue" },
  { value: "pediatric", label: "Child / Pediatric", desc: "Health concern for a child (0–14 yrs)" },
  { value: "mental", label: "Mental Health", desc: "Stress, anxiety, depression, sleep issues" },
  { value: "lab-review", label: "Lab Reports Review", desc: "Doctor review of test results" },
  { value: "prescription", label: "Prescription Renewal", desc: "Renew an existing prescription" },
  { value: "emergency", label: "Urgent / Emergency", desc: "Severe pain, breathing difficulty, injury" },
];

export const SYMPTOMS = [
  "Fever",
  "Cough / Cold",
  "Headache",
  "Body Pain",
  "Sore Throat",
  "Stomach Pain",
  "Nausea / Vomiting",
  "Skin Rash / Itching",
  "Breathing Difficulty",
  "Chest Pain",
  "Joint / Back Pain",
  "Dizziness",
  "Diarrhea",
  "Fatigue / Weakness",
  "Other",
];

export const RELATIONS = [
  "Self",
  "Father",
  "Mother",
  "Spouse",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Grandparent",
  "Other Relative",
];
