import { z } from "zod";

export const personSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

// Transform string/number input to number for form inputs
// HTML number inputs return strings, so we preprocess them to numbers
const numberFromString = z.preprocess(
  (val) => {
    if (val === "" || val === null || val === undefined) return 0;
    const num = typeof val === "string" ? parseFloat(val) : Number(val);
    return isNaN(num) ? val : num;
  },
  z.number().min(0, "Price must be 0 or greater")
);

export const conferenceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  price: numberFromString,
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
});

export type PersonFormValues = z.infer<typeof personSchema>;
export type ConferenceFormValues = z.infer<typeof conferenceSchema>;
