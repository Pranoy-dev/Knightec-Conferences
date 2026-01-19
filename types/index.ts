export type Person = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Conference = {
  id: string;
  name: string;
  location: string;
  category: string;
  price: number;
  currency: string;
  office_id: string | null;
  assigned_to: string | null;
  start_date: string | null;
  end_date: string | null;
  event_link: string | null;
  notes: string | null;
  status: "Interested" | "Planned" | "Booked" | "Attended" | null;
  reason_to_go: string | null;
  created_at: string;
  updated_at: string;
};

export type Rating = {
  id: string;
  conference_id: string;
  accessibility_rating: number | null;
  skill_improvement_rating: number | null;
  finding_partners_rating: number | null;
  created_at: string;
  updated_at: string;
};

export type ConferenceWithRating = Conference & {
  rating?: Rating | null;
};

export type ConferenceWithPerson = Conference & {
  person?: Person | null;
};

export type ConferenceFormData = {
  name: string;
  location: string;
  category: string;
  price: number;
  currency: string;
  office_id?: string;
  assigned_to: string;
  start_date?: string;
  end_date?: string;
  event_link?: string;
  notes?: string;
  status?: "Interested" | "Planned" | "Booked" | "Attended";
  reason_to_go?: string | null;
  accessibility_rating?: number | null;
  skill_improvement_rating?: number | null;
  finding_partners_rating?: number | null;
};

export type RatingFormData = {
  conference_id: string;
  accessibility_rating?: number | null;
  skill_improvement_rating?: number | null;
  finding_partners_rating?: number | null;
};

export type PersonFormData = {
  name: string;
  email: string;
};

export type Category = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type CategoryFormData = {
  name: string;
};

export type Office = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type OfficeFormData = {
  name: string;
};

export type ConferenceFilters = {
  category?: string;
  location?: string;
  assigned_to?: string;
  status?: string;
  price_min?: number;
  price_max?: number;
  search?: string;
  office?: string;
};
