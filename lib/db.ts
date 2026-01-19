import { getSupabaseClient } from "./supabase";
import type { Person, Conference, ConferenceFormData, PersonFormData, Category, CategoryFormData, Office, OfficeFormData, Rating, RatingFormData, ConferenceWithRating } from "@/types";
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
export async function getAllConferences(): Promise<ConferenceWithRating[]> {
  const supabase = getSupabaseClient();
  
  // First, try to fetch with ratings join
  const { data, error } = await supabase
    .from("conferences")
    .select(`
      *,
      rating:ratings(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    // If error is about missing relation or table, try without join
    if (error.message.includes("relation") || error.message.includes("does not exist") || error.message.includes("ratings")) {
      // Fallback: fetch conferences without ratings
      const { data: confData, error: confError } = await supabase
        .from("conferences")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (confError) {
        throw new Error(`Failed to fetch conferences: ${confError.message}`);
      }
      
      return (confData || []).map((conference: any) => ({
        ...conference,
        rating: null,
      })) as ConferenceWithRating[];
    }
    throw new Error(`Failed to fetch conferences: ${error.message}`);
  }

  // Transform the data to match ConferenceWithRating type
  return (data || []).map((conference: any) => {
    // Handle rating - it might be an array or null
    let rating = null;
    if (conference.rating) {
      if (Array.isArray(conference.rating)) {
        rating = conference.rating.length > 0 ? conference.rating[0] : null;
      } else {
        rating = conference.rating;
      }
    }
    
    // Remove rating from conference object before spreading
    const { rating: _, ...conferenceData } = conference;
    
    return {
      ...conferenceData,
      rating,
    };
  }) as ConferenceWithRating[];
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

export async function createConference(conferenceData: ConferenceFormData): Promise<ConferenceWithRating> {
  const supabase = getSupabaseClient();
  
  // Build insert data object, only including office_id if it's provided
  const insertData: any = {
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
    reason_to_go: conferenceData.reason_to_go ?? null,
  };
  
  // Only add office_id if it's provided (column might not exist in older databases)
  if (conferenceData.office_id) {
    insertData.office_id = conferenceData.office_id;
  }
  
  const { data, error } = await supabase
    .from("conferences")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    // Provide more helpful error messages
    if (error.message.includes("office_id") || error.message.includes("column") || error.message.includes("does not exist")) {
      throw new Error(`Database error: The office_id column may not exist. Please run the migration: ALTER TABLE conferences ADD COLUMN office_id UUID REFERENCES offices(id);`);
    }
    throw new Error(`Failed to create conference: ${error.message}`);
  }

  const conference = data as Conference;

  // Create rating if provided
  let rating: Rating | null = null;
  if (
    conferenceData.accessibility_rating !== null && conferenceData.accessibility_rating !== undefined ||
    conferenceData.skill_improvement_rating !== null && conferenceData.skill_improvement_rating !== undefined ||
    conferenceData.finding_partners_rating !== null && conferenceData.finding_partners_rating !== undefined
  ) {
    const ratingData: RatingFormData = {
      conference_id: conference.id,
      accessibility_rating: conferenceData.accessibility_rating ?? null,
      skill_improvement_rating: conferenceData.skill_improvement_rating ?? null,
      finding_partners_rating: conferenceData.finding_partners_rating ?? null,
    };
    rating = await createOrUpdateRating(ratingData);
  }

  return { ...conference, rating };
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
): Promise<ConferenceWithRating> {
  const supabase = getSupabaseClient();
  
  // Build update data object
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
    reason_to_go: conferenceData.reason_to_go ?? null,
  };
  
  // Only add office_id if it's provided (column might not exist in older databases)
  if (conferenceData.office_id !== undefined) {
    updateData.office_id = conferenceData.office_id || null;
  }
  
  // Type assertion to fix TypeScript inference issue with Supabase update types in Vercel build
  const { data, error } = await (supabase.from("conferences") as any)
    .update(updateData)
    .eq("id", conferenceId)
    .select()
    .single();

  if (error) {
    // Provide more helpful error messages
    if (error.message.includes("office_id") || error.message.includes("column") || error.message.includes("does not exist")) {
      throw new Error(`Database error: The office_id column may not exist. Please run the migration: ALTER TABLE conferences ADD COLUMN office_id UUID REFERENCES offices(id);`);
    }
    throw new Error(`Failed to update conference: ${error.message}`);
  }

  const conference = data as Conference;

  // Create or update rating if provided
  let rating: Rating | null = null;
  if (
    conferenceData.accessibility_rating !== null && conferenceData.accessibility_rating !== undefined ||
    conferenceData.skill_improvement_rating !== null && conferenceData.skill_improvement_rating !== undefined ||
    conferenceData.finding_partners_rating !== null && conferenceData.finding_partners_rating !== undefined
  ) {
    const ratingData: RatingFormData = {
      conference_id: conferenceId,
      accessibility_rating: conferenceData.accessibility_rating ?? null,
      skill_improvement_rating: conferenceData.skill_improvement_rating ?? null,
      finding_partners_rating: conferenceData.finding_partners_rating ?? null,
    };
    rating = await createOrUpdateRating(ratingData);
  } else {
    // If all ratings are null/undefined, delete the rating if it exists
    await deleteRating(conferenceId);
  }

  return { ...conference, rating };
}

// Rating operations
export async function createOrUpdateRating(ratingData: RatingFormData): Promise<Rating> {
  const supabase = getSupabaseClient();
  
  // Check if rating exists
  const { data: existingRating } = await supabase
    .from("ratings")
    .select("*")
    .eq("conference_id", ratingData.conference_id)
    .single();

  if (existingRating) {
    // Update existing rating
    const { data, error } = await supabase
      .from("ratings")
      .update({
        accessibility_rating: ratingData.accessibility_rating ?? null,
        skill_improvement_rating: ratingData.skill_improvement_rating ?? null,
        finding_partners_rating: ratingData.finding_partners_rating ?? null,
      })
      .eq("conference_id", ratingData.conference_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update rating: ${error.message}`);
    }

    return data as Rating;
  } else {
    // Create new rating
    const { data, error } = await supabase
      .from("ratings")
      .insert({
        conference_id: ratingData.conference_id,
        accessibility_rating: ratingData.accessibility_rating ?? null,
        skill_improvement_rating: ratingData.skill_improvement_rating ?? null,
        finding_partners_rating: ratingData.finding_partners_rating ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create rating: ${error.message}`);
    }

    return data as Rating;
  }
}

export async function deleteRating(conferenceId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("conference_id", conferenceId);

  if (error) {
    // Don't throw error if rating doesn't exist
    if (!error.message.includes("No rows")) {
      throw new Error(`Failed to delete rating: ${error.message}`);
    }
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
