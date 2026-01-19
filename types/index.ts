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
  created_at: string;
  updated_at: string;
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
