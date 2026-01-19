import { z } from "zod";

export const personSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export const conferenceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
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
export type ConferenceFormValues = z.output<typeof conferenceSchema>;
