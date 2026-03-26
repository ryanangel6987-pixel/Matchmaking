import { z } from "zod";

// ─── Enums matching database types ───────────────────────────────────────────

export const communicationChannelEnum = z.enum([
  "slack",
  "whatsapp",
  "text",
  "email",
]);

export const onboardingStatusEnum = z.enum([
  "not_started",
  "in_progress",
  "completed",
  "approved",
]);

export const preferenceAssetTypeEnum = z.enum(["ex", "ideal", "aspirational"]);

// ─── OnboardingData schema ───────────────────────────────────────────────────

export const OnboardingDataSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),

  // Section A: Client Context
  full_name: z.string().min(1).nullable().optional(),
  age: z.number().int().min(18).max(120).nullable().optional(),
  city: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  profession: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  height_inches: z.number().int().min(48).max(96).nullable().optional(),
  dating_apps_used: z.array(z.string()).nullable().optional(),
  dating_apps_open_to: z.array(z.string()).nullable().optional(),
  hobbies_and_interests: z.array(z.string()).nullable().optional(),
  surprising_fact: z.string().nullable().optional(),
  personality_summary: z.string().nullable().optional(),
  lifestyle_notes: z.string().nullable().optional(),

  // Section B: What He Wants
  target_age_min: z.number().int().min(18).max(120).nullable().optional(),
  target_age_max: z.number().int().min(18).max(120).nullable().optional(),
  target_max_distance_miles: z.number().int().min(1).nullable().optional(),
  target_physical_preferences: z.record(z.string(), z.unknown()).nullable().optional(),
  target_education_preference: z.string().nullable().optional(),
  target_profession_preferences: z.array(z.string()).nullable().optional(),
  target_deal_breakers: z.array(z.string()).nullable().optional(),
  target_relationship_intent: z.string().nullable().optional(),
  target_date_frequency: z.string().nullable().optional(),

  // Section C: Operational Notes
  days_available: z.array(z.string()).nullable().optional(),
  preferred_date_times: z.array(z.string()).nullable().optional(),
  blackout_dates: z.array(z.string()).nullable().optional(), // ISO date strings
  preferred_first_date_style: z.string().nullable().optional(),
  preferred_neighborhoods: z.array(z.string()).nullable().optional(),
  venues_to_use: z.array(z.string()).nullable().optional(),
  venues_to_avoid: z.array(z.string()).nullable().optional(),
  budget_comfort: z.string().nullable().optional(),
  preferred_communication_channel: communicationChannelEnum.nullable().optional(),
  communication_channel_verified: z.boolean().nullable().optional(),
  target_30_day_outcome: z.string().nullable().optional(),
  prior_matchmaker_experience: z.string().nullable().optional(),
  anything_else: z.string().nullable().optional(),

  // Photo and AI Permissions
  ai_enhancement_consent: z.boolean().nullable().optional(),
  photo_exclusions: z.array(z.string()).nullable().optional(),

  // App History
  previous_apps: z.array(z.string()).nullable().optional(),
  previous_services: z.array(z.string()).nullable().optional(),

  // Migration 005: Drinking & date type
  drinks_alcohol: z.string().nullable().optional(),
  preferred_date_type: z.string().nullable().optional(),
  drink_preferences: z.string().nullable().optional(),

  // Migration 007: Kids, education, notes
  has_kids: z.string().nullable().optional(),
  kids_details: z.string().nullable().optional(),
  education: z.array(z.string()).nullable().optional(),
  client_notes: z.string().nullable().optional(),
});

export type OnboardingData = z.infer<typeof OnboardingDataSchema>;

// ─── Preferences schema ─────────────────────────────────────────────────────

export const PreferencesSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  target_age_min: z.number().int().min(18).max(120).nullable().optional(),
  target_age_max: z.number().int().min(18).max(120).nullable().optional(),
  max_distance_miles: z.number().int().min(1).nullable().optional(),
  physical_preferences: z.record(z.string(), z.unknown()).nullable().optional(),
  education_preference: z.string().nullable().optional(),
  profession_preferences: z.array(z.string()).nullable().optional(),
  deal_breakers: z.array(z.string()).nullable().optional(),
  relationship_intent: z.string().nullable().optional(),
  date_frequency: z.string().nullable().optional(),
  // Migration 007 additions
  kids_preference: z.string().nullable().optional(),
  target_notes: z.string().nullable().optional(),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

// ─── Credentials schema (for credential vault form) ─────────────────────────

export const CredentialsSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid(),
  app_id: z.string().uuid(),
  username: z
    .string()
    .min(1, "Username is required"),
  password: z
    .string()
    .min(1, "Password is required"),
  associated_phone: z.string().nullable().optional(),
});

export type Credentials = z.infer<typeof CredentialsSchema>;
