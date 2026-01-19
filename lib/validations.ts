import { z } from "zod";

/**
 * Utility function to create a number schema for form inputs.
 * 
 * HTML number inputs always return strings, so this utility:
 * - Accepts string input (what HTML provides)
 * - Transforms to number output (what we need)
 * - Provides explicit types that work with react-hook-form + zodResolver
 * 
 * Usage:
 *   price: formNumberSchema({ min: 0, message: "Price must be 0 or greater" })
 * 
 * This pattern ensures type safety and prevents TypeScript errors in strict mode.
 */
export function formNumberSchema(options?: { min?: number; max?: number; message?: string }) {
  const { min, max, message = "Invalid number" } = options || {};
  
  // Accept both string (from HTML inputs) and number (from form state)
  return z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return 0;
      const num = typeof val === "string" ? parseFloat(val) : val;
      return isNaN(num) ? 0 : num;
    })
    .pipe(z.number())
    .refine((val) => {
      if (min !== undefined && val < min) return false;
      if (max !== undefined && val > max) return false;
      return true;
    }, {
      message: message,
    });
}

/**
 * Type helper for form schemas with number fields.
 * 
 * This ensures proper type inference for react-hook-form:
 * - Input type: what form fields actually are (strings from HTML inputs)
 * - Output type: what we get after validation (numbers)
 * 
 * Usage:
 *   type FormInput = FormInputType<typeof schema>;
 *   type FormOutput = FormOutputType<typeof schema>;
 */
export type FormInputType<T extends z.ZodTypeAny> = z.input<T>;
export type FormOutputType<T extends z.ZodTypeAny> = z.output<T>;

// Person schema
export const personSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

// Conference schema
// Note: price uses formNumberSchema() which explicitly types input as string and output as number
export const conferenceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  price: formNumberSchema({ min: 0, message: "Price must be 0 or greater" }),
  currency: z.enum(["SEK", "USD", "EUR", "GBP", "NOK", "DKK"]).default("SEK"),
  assigned_to: z.string().min(1, "Please assign to a person"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  event_link: z
    .string()
    .optional()
    .refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
      message: "Invalid URL",
    }),
  notes: z.string().optional(),
  status: z.enum(["Interested", "Planned", "Booked", "Attended"]).optional(),
  accessibility_rating: z.number().int().min(1).max(5).nullable().optional(),
  skill_improvement_rating: z.number().int().min(1).max(5).nullable().optional(),
  finding_partners_rating: z.number().int().min(1).max(5).nullable().optional(),
  reason_to_go: z.string().max(500).nullable().optional(),
});

// Form value types - use output types (what we get after validation)
export type PersonFormValues = FormOutputType<typeof personSchema>;
export type ConferenceFormValues = FormOutputType<typeof conferenceSchema>;
