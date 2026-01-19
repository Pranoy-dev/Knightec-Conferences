import { getSupabaseClient } from "./supabase";
import type { Person, Conference, ConferenceFormData, PersonFormData, Category, CategoryFormData, Office, OfficeFormData } from "@/types";
import type { Database } from "./database.types";

// People operations
export async function getAllPeople(): Promise<Person[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch people: ${error.message}`);
  }

  // Type assertion to fix TypeScript inference issue in Vercel build
  return (data || []) as Person[];
}

export async function createPerson(personData: PersonFormData): Promise<Person> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("people")
    .insert({
      name: personData.name,
      email: personData.email,
    } as any)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new Error("Email already exists. Please use a different email.");
    }
    throw new Error(`Failed to create person: ${error.message}`);
  }

  // Type assertion to fix TypeScript inference issue in Vercel build
  return data as Person;
}

// Conference operations
export async function getAllConferences(): Promise<Conference[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("conferences")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch conferences: ${error.message}`);
  }

  // Type assertion to fix TypeScript inference issue in Vercel build
  return (data || []) as Conference[];
}

export async function getConferencesWithPeople(): Promise<Array<Conference & { person: Person | null }>> {
  const supabase = getSupabaseClient();
  const { data: conferences, error: conferencesError } = await supabase
    .from("conferences")
    .select("*")
    .order("created_at", { ascending: false });

  if (conferencesError) {
    throw new Error(`Failed to fetch conferences: ${conferencesError.message}`);
  }

  if (!conferences || conferences.length === 0) {
    return [];
  }

  // Type assertion to fix TypeScript inference issue in Vercel build
  const typedConferences = conferences as Conference[];

  // Get unique person IDs
  const personIds = [...new Set(typedConferences.map((c) => c.assigned_to).filter(Boolean))];

  // Fetch all people
  const { data: people, error: peopleError } = await getSupabaseClient()
    .from("people")
    .select("*")
    .in("id", personIds);

  if (peopleError) {
    throw new Error(`Failed to fetch people: ${peopleError.message}`);
  }

  // Type assertion to fix TypeScript inference issue in Vercel build
  const typedPeople = (people || []) as Person[];

  // Map people to conferences
  const peopleMap = new Map(typedPeople.map((p) => [p.id, p]));

  return typedConferences.map((conference) => ({
    ...conference,
    person: conference.assigned_to ? peopleMap.get(conference.assigned_to) || null : null,
  }));
}

export async function createConference(conferenceData: ConferenceFormData): Promise<Conference> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("conferences")
    .insert({
      name: conferenceData.name,
      location: conferenceData.location,
      category: conferenceData.category,
      price: conferenceData.price,
      currency: conferenceData.currency || "SEK",
      assigned_to: conferenceData.assigned_to || null,
      start_date: conferenceData.start_date || null,
      end_date: conferenceData.end_date || null,
      event_link: conferenceData.event_link || null,
      notes: conferenceData.notes || null,
      status: conferenceData.status || null,
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create conference: ${error.message}`);
  }

  // Type assertion to fix TypeScript inference issue in Vercel build
  return data as Conference;
}

export async function getUniqueCategories(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  // Type assertion to fix TypeScript inference issue in Vercel build
  const typedData = (data || []) as Array<{ name: string }>;

  return typedData.map((c) => c.name);
}

// Category operations
export async function getAllCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  // Type assertion to fix TypeScript inference issue in Vercel build
  return (data || []) as Category[];
}

export async function createCategory(categoryData: CategoryFormData): Promise<Category> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: categoryData.name,
    } as any)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new Error("Category already exists. Please use a different name.");
    }
    throw new Error(`Failed to create category: ${error.message}`);
  }

  // Type assertion to fix TypeScript inference issue in Vercel build
  return data as Category;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
}

// Office operations
export async function getAllOffices(): Promise<Office[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch offices: ${error.message}`);
  }

  return (data || []) as Office[];
}

export async function createOffice(officeData: OfficeFormData): Promise<Office> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("offices")
    .insert({
      name: officeData.name,
    } as any)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new Error("Office already exists. Please use a different name.");
    }
    throw new Error(`Failed to create office: ${error.message}`);
  }

  return data as Office;
}

export async function deleteOffice(officeId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("offices").delete().eq("id", officeId);

  if (error) {
    throw new Error(`Failed to delete office: ${error.message}`);
  }
}

export async function deletePerson(personId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("people")
    .delete()
    .eq("id", personId);

  if (error) {
    throw new Error(`Failed to delete person: ${error.message}`);
  }
}

export async function updateConference(
  conferenceId: string,
  conferenceData: ConferenceFormData
): Promise<Conference> {
  const supabase = getSupabaseClient();
  const updateData: any = {
    name: conferenceData.name,
    location: conferenceData.location,
    category: conferenceData.category,
    price: conferenceData.price,
    currency: conferenceData.currency || "SEK",
    assigned_to: conferenceData.assigned_to || null,
    start_date: conferenceData.start_date || null,
    end_date: conferenceData.end_date || null,
    event_link: conferenceData.event_link || null,
    notes: conferenceData.notes || null,
    status: conferenceData.status || null,
  };
  
  // Type assertion to fix TypeScript inference issue with Supabase update types in Vercel build
  const { data, error } = await (supabase.from("conferences") as any)
    .update(updateData)
    .eq("id", conferenceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update conference: ${error.message}`);
  }

  // Type assertion to fix TypeScript inference issue in Vercel build
  return data as Conference;
}

export async function deleteConference(conferenceId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("conferences")
    .delete()
    .eq("id", conferenceId);

  if (error) {
    throw new Error(`Failed to delete conference: ${error.message}`);
  }
}
