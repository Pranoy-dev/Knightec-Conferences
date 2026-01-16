import { getSupabaseClient } from "./supabase";
import type { Person, Conference, ConferenceFormData, PersonFormData } from "@/types";

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

  return data || [];
}

export async function createPerson(personData: PersonFormData): Promise<Person> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("people")
    .insert({
      name: personData.name,
      email: personData.email,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new Error("Email already exists. Please use a different email.");
    }
    throw new Error(`Failed to create person: ${error.message}`);
  }

  return data;
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

  return data || [];
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

  // Get unique person IDs
  const personIds = [...new Set(conferences.map((c) => c.assigned_to).filter(Boolean))];

  // Fetch all people
  const { data: people, error: peopleError } = await getSupabaseClient()
    .from("people")
    .select("*")
    .in("id", personIds);

  if (peopleError) {
    throw new Error(`Failed to fetch people: ${peopleError.message}`);
  }

  // Map people to conferences
  const peopleMap = new Map(people?.map((p) => [p.id, p]) || []);

  return conferences.map((conference) => ({
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
      assigned_to: conferenceData.assigned_to || null,
      start_date: conferenceData.start_date || null,
      end_date: conferenceData.end_date || null,
      event_link: conferenceData.event_link || null,
      notes: conferenceData.notes || null,
      status: conferenceData.status || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create conference: ${error.message}`);
  }

  return data;
}

export async function getUniqueCategories(): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("conferences")
    .select("category")
    .order("category", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  const categories = [...new Set(data?.map((c) => c.category) || [])];
  return categories;
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
