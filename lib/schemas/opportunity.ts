import { z } from "zod";

export const createOpportunitySchema = z.object({
  candidateName: z.string().min(2, "Name required (min 2 characters)"),
  candidateAge: z.string().optional(),
  candidateProfession: z.string().optional(),
  candidateLocation: z.string().optional(),
  candidateEducation: z.string().optional(),
  appId: z.string().optional(),
  memorableDetail: z.string().optional(),
  phoneNumber: z.string().optional(),
  dayDetermined: z.boolean(),
  proposedDay: z.string().optional(),
  proposedTime: z.string().optional(),
  venueId: z.string().optional(),
  prewrittenText: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => !data.dayDetermined || data.proposedDay,
  { message: "Day required when determined", path: ["proposedDay"] }
);

export const editOpportunitySchema = z.object({
  candidateName: z.string().min(2, "Name required (min 2 characters)"),
  candidateAge: z.string().optional(),
  candidateProfession: z.string().optional(),
  candidateLocation: z.string().optional(),
  candidateEducation: z.string().optional(),
  phoneNumber: z.string().optional(),
  memorableDetail: z.string().optional(),
  dayDetermined: z.boolean(),
  proposedDay: z.string().optional(),
  proposedTime: z.string().optional(),
  venueId: z.string().optional(),
  prewrittenText: z.string().optional(),
  notes: z.string().optional(),
  candidatePhotoUrl: z.string().optional(),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type EditOpportunityInput = z.infer<typeof editOpportunitySchema>;
