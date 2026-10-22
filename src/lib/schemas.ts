import { z } from "zod";

/** Mirrors the CHECK constraints in migration 0004 — client-side first, DB always wins. */
export const appointmentSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  department_id: z.string().uuid().optional().or(z.literal("")),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  reason: z.string().trim().max(1000, "Please keep it under 1000 characters").optional().or(z.literal("")),
});

export const feedbackSchema = z.object({
  category: z.enum(["enquiry", "complaint", "compliment", "suggestion"]),
  full_name: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Please tell us a little more (min 5 characters)").max(3000),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
