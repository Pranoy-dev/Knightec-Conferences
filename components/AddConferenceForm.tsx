"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  conferenceSchema,
  type ConferenceFormValues,
  type FormInputType,
  type FormOutputType,
} from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createConference, updateConference, getAllCategories, createCategory, getAllOffices, createOffice } from "@/lib/db";
import { toast } from "sonner";
import type { Person, Category, Office, ConferenceFormData } from "@/types";
import { useEffect, useState, useRef } from "react";
import { CategorySearch } from "./CategorySearch";
import { OfficeSearch } from "./OfficeSearch";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { RatingInput } from "@/components/ui/rating-input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const STATUS_OPTIONS = [
  { value: "Interested", label: "Interested" },
  { value: "Planned", label: "Planned" },
  { value: "Booked", label: "Booked" },
  { value: "Attended", label: "Attended" },
] as const;

export interface AddConferenceFormProps {
  people: Person[];
  onSuccess?: () => void;
  onCancel?: () => void;
  conferenceId?: string; // If provided, form will update instead of create
  initialData?: Partial<{
    name: string;
    location: string;
    category: string;
    price: number;
    currency: string;
    assigned_to: string;
    start_date: string;
    end_date: string;
    event_link: string;
    notes: string;
    status: "Interested" | "Planned" | "Booked" | "Attended";
    accessibility_rating: number | null;
    skill_improvement_rating: number | null;
    finding_partners_rating: number | null;
    reason_to_go: string | null;
    fee_link: string;
    partnership: string;
    fee: string;
  }>;
  selectedCategories?: string[];
  onCategoriesChange?: (categories: string[]) => void;
  selectedOffices?: string[];
  onOfficesChange?: (offices: string[]) => void;
}

export function AddConferenceForm({ 
  people, 
  onSuccess, 
  onCancel,
  conferenceId,
  initialData,
  selectedCategories: externalSelectedCategories = [],
  onCategoriesChange,
  selectedOffices: externalSelectedOffices = [],
  onOfficesChange,
}: AddConferenceFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(externalSelectedCategories);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOffices, setSelectedOffices] = useState<string[]>(externalSelectedOffices);
  const [isCreatingOffice, setIsCreatingOffice] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [lastScrapedUrl, setLastScrapedUrl] = useState<string>("");
  const scrapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currency, setCurrency] = useState<string>(initialData?.currency || "SEK"); // Default currency
  const [openSections, setOpenSections] = useState({
    eventDetails: true,
    knightecInfo: false,
    datePrice: true,
    ratings: false,
  });

  // Use explicit input/output types for type safety with zodResolver
  // Input type: what form fields are (strings from HTML inputs, or numbers from form state)
  // Output type: what we get after validation (numbers)
  type FormInput = FormInputType<typeof conferenceSchema>;
  type FormOutput = FormOutputType<typeof conferenceSchema>;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(conferenceSchema),
    defaultValues: {
      name: initialData?.name || "",
      location: initialData?.location || "",
      category: initialData?.category || "",
      price: initialData?.price !== undefined ? String(initialData.price) : "0", // String input (HTML input type) - will be transformed to number
      currency: (initialData?.currency || "SEK") as "SEK" | "USD" | "EUR" | "GBP" | "NOK" | "DKK",
      assigned_to: initialData?.assigned_to || "",
      start_date: initialData?.start_date || "",
      end_date: initialData?.end_date || "",
      event_link: initialData?.event_link || "",
      notes: initialData?.notes || "",
      status: initialData?.status || undefined,
      accessibility_rating: initialData?.accessibility_rating ?? null,
      skill_improvement_rating: initialData?.skill_improvement_rating ?? null,
      finding_partners_rating: initialData?.finding_partners_rating ?? null,
      reason_to_go: initialData?.reason_to_go ?? null,
      fee_link: initialData?.fee_link || "",
      partnership: initialData?.partnership || "",
      fee: initialData?.fee || "",
    },
  });

  // Watch form values to automatically open sections and validate
  const watchedValues = form.watch();
  
  // Check if Event Details section is complete (mandatory)
  const isEventDetailsComplete = !!(watchedValues.name?.trim() && watchedValues.location?.trim());
  
  // Check if Knightec Info section is complete (mandatory)
  const isKnightecInfoComplete = !!(watchedValues.assigned_to && selectedCategories.length > 0);
  
  // Ratings are optional - no validation required

  // Check if all mandatory sections are complete
  const isFormValid = isEventDetailsComplete && isKnightecInfoComplete;

  // Auto-open sections based on completion (progressive disclosure)
  useEffect(() => {
    // Open Event Details when event link is added
    if (watchedValues.event_link?.trim() && !openSections.eventDetails) {
      setOpenSections(prev => ({ ...prev, eventDetails: true }));
    }
    
    // Open Knightec Info when Event Details is complete
    if (isEventDetailsComplete && !openSections.knightecInfo) {
      setOpenSections(prev => ({ ...prev, knightecInfo: true }));
    }
    
    // Open Date and Price when Knightec Info is complete
    if (isKnightecInfoComplete && !openSections.datePrice) {
      setOpenSections(prev => ({ ...prev, datePrice: true }));
    }
    
    // Open Ratings when Date and Price section is interacted with (price is filled)
    if (watchedValues.price && watchedValues.price !== "0" && watchedValues.price !== "" && !openSections.ratings) {
      setOpenSections(prev => ({ ...prev, ratings: true }));
    }
  }, [watchedValues.event_link, isEventDetailsComplete, isKnightecInfoComplete, watchedValues.price, openSections]);

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      const currencyValue = (initialData.currency || "SEK") as "SEK" | "USD" | "EUR" | "GBP" | "NOK" | "DKK";
      setCurrency(initialData.currency || "SEK");
      form.reset({
        name: initialData.name || "",
        location: initialData.location || "",
        category: initialData.category || "",
        price: initialData.price !== undefined ? String(initialData.price) : "0",
        currency: currencyValue,
        assigned_to: initialData.assigned_to || "",
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
        event_link: initialData.event_link || "",
        notes: initialData.notes || "",
        status: initialData.status || undefined,
        accessibility_rating: initialData.accessibility_rating ?? null,
        skill_improvement_rating: initialData.skill_improvement_rating ?? null,
        finding_partners_rating: initialData.finding_partners_rating ?? null,
        reason_to_go: initialData.reason_to_go ?? null,
        fee_link: initialData.fee_link || "",
        partnership: initialData.partnership || "",
        fee: initialData.fee || "",
      });
    }
  }, [initialData, form]);
  
  // Watch for category changes specifically and update the form field immediately
  useEffect(() => {
    if (initialData?.category !== undefined) {
      // Use setValue to update the field without triggering validation
      form.setValue("category", initialData.category, { shouldValidate: false });
    }
  }, [initialData?.category]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, offs] = await Promise.all([
          getAllCategories(),
          getAllOffices(),
        ]);
        setCategories(cats);
        setOffices(offs);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  // Sync external selected categories - but don't preselect from initialData
  useEffect(() => {
    // Only sync if external categories are explicitly provided and not from initialData
    // If externalSelectedCategories is empty, keep it empty (don't preselect)
    setSelectedCategories(externalSelectedCategories);
  }, [externalSelectedCategories.join(",")]);
  
  // Reset categories when form is first loaded with initialData
  useEffect(() => {
    if (initialData && !externalSelectedCategories.length) {
      // Don't preselect categories from initialData.category
      setSelectedCategories([]);
    }
  }, [initialData?.name]); // Reset when event name changes (new scrape)

  // Sync external selected offices
  useEffect(() => {
    setSelectedOffices(externalSelectedOffices);
  }, [externalSelectedOffices.join(",")]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrapeTimeoutRef.current) {
        clearTimeout(scrapeTimeoutRef.current);
      }
    };
  }, []);

  // Update form when selected categories change
  useEffect(() => {
    const categoryValue = selectedCategories.length > 0 ? selectedCategories.join(", ") : "";
    form.setValue("category", categoryValue);
    onCategoriesChange?.(selectedCategories);
  }, [selectedCategories.join(","), form, onCategoriesChange]);

  // Handle category toggle - create if doesn't exist
  const handleCategoryToggle = async (categoryName: string) => {
    if (isCreatingCategory) return;
    
    setIsCreatingCategory(true);
    try {
      // Check if category exists
      let categoryToUse = categories.find(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      
      if (!categoryToUse) {
        // Category doesn't exist, create it
        try {
          const newCategory = await createCategory({ name: categoryName });
          const updatedCategories = await getAllCategories();
          setCategories(updatedCategories);
          categoryToUse = updatedCategories.find(
            (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
          ) || newCategory;
          toast.success(`Category "${categoryName}" created successfully!`);
        } catch (error) {
          const updatedCategories = await getAllCategories();
          setCategories(updatedCategories);
          const found = updatedCategories.find(
            (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
          );
          if (found) {
            categoryToUse = found;
          } else {
            throw error;
          }
        }
      }
      
      // Toggle category selection
      const categoryNameToUse = categoryToUse.name;
      setSelectedCategories((prev) => {
        const updated = prev.includes(categoryNameToUse)
          ? prev.filter((cat) => cat !== categoryNameToUse)
          : [...prev, categoryNameToUse];
        return updated;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create category";
      toast.error(errorMessage);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Handle office toggle - create if doesn't exist
  const handleOfficeToggle = async (officeName: string) => {
    if (isCreatingOffice) return;
    
    setIsCreatingOffice(true);
    try {
      // Check if office exists
      let officeToUse = offices.find(
        (office) => office.name.toLowerCase() === officeName.toLowerCase()
      );
      
      if (!officeToUse) {
        // Office doesn't exist, create it
        try {
          const newOffice = await createOffice({ name: officeName });
          const updatedOffices = await getAllOffices();
          setOffices(updatedOffices);
          officeToUse = updatedOffices.find(
            (office) => office.name.toLowerCase() === officeName.toLowerCase()
          ) || newOffice;
          toast.success(`Office "${officeName}" created successfully!`);
        } catch (error) {
          const updatedOffices = await getAllOffices();
          setOffices(updatedOffices);
          const found = updatedOffices.find(
            (office) => office.name.toLowerCase() === officeName.toLowerCase()
          );
          if (found) {
            officeToUse = found;
          } else {
            throw error;
          }
        }
      }
      
      // Toggle office selection (single selection for office)
      const officeNameToUse = officeToUse.name;
      const isCurrentlySelected = selectedOffices.includes(officeNameToUse);
      
      setSelectedOffices((prev) => {
        // For office, we only allow single selection, so replace the array
        const updated = isCurrentlySelected ? [] : [officeNameToUse];
        return updated;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create office";
      toast.error(errorMessage);
    } finally {
      setIsCreatingOffice(false);
    }
  };

  useEffect(() => {
    if (people.length === 0) {
      toast.error("Please add a person first before creating a conference");
    }
  }, [people]);

  const onSubmit = async (data: ConferenceFormValues) => {
    if (people.length === 0) {
      toast.error("Please add a person first");
      return;
    }

    try {
      // Ensure category is properly set from selected categories
      if (selectedCategories.length > 0) {
        data.category = selectedCategories.join(", ");
      }

      // Get office_id from selected office
      let officeId: string | undefined = undefined;
      if (selectedOffices.length > 0) {
        const selectedOfficeName = selectedOffices[0];
        const selectedOffice = offices.find(
          (o) => o.name.toLowerCase() === selectedOfficeName.toLowerCase()
        );
        if (selectedOffice) {
          officeId = selectedOffice.id;
        }
      }

      // Normalize empty strings to undefined for optional fields (will be converted to null in db)
      const normalizedData: ConferenceFormData = {
        name: data.name,
        location: data.location,
        category: data.category,
        price: data.price,
        currency: data.currency,
        office_id: officeId,
        assigned_to: data.assigned_to,
        start_date: data.start_date?.trim() || undefined,
        end_date: data.end_date?.trim() || undefined,
        event_link: data.event_link?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        status: data.status,
        accessibility_rating: data.accessibility_rating ?? null,
        skill_improvement_rating: data.skill_improvement_rating ?? null,
        finding_partners_rating: data.finding_partners_rating ?? null,
        reason_to_go: data.reason_to_go?.trim() || null,
        fee_link: data.fee_link?.trim() || undefined,
        partnership: data.partnership?.trim() || undefined,
        fee: data.fee?.trim() || undefined,
      };

      if (conferenceId) {
        await updateConference(conferenceId, normalizedData);
        toast.success("Conference updated successfully!");
      } else {
        await createConference(normalizedData);
        toast.success("Conference added successfully!");
        form.reset();
        setCurrency("SEK");
        // Reset ratings and reason_to_go
        form.setValue("accessibility_rating", null);
        form.setValue("skill_improvement_rating", null);
        form.setValue("finding_partners_rating", null);
        form.setValue("reason_to_go", null);
        form.setValue("fee_link", "");
        form.setValue("partnership", "");
        form.setValue("fee", "");
      }
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : conferenceId 
          ? "Failed to update conference" 
          : "Failed to add conference";
      toast.error(errorMessage);
    }
  };

  if (people.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No people available. Please add a person first.</p>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Go Back
          </Button>
        )}
      </div>
    );
  }

  // Handle URL paste and auto-scrape
  const handleUrlChange = async (url: string) => {
    // Only scrape if URL is valid and different from last scraped URL
    if (!url || url === lastScrapedUrl || !url.match(/^https?:\/\//i)) {
      return;
    }

    setIsScraping(true);
    try {
      const response = await fetch("/api/scrape-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to scrape event");
      }

      const result = await response.json();
      const scrapedData = result.data;
      
      // Auto-fill form fields with scraped data (only if field is empty)
      if (scrapedData.name && !form.getValues("name")) {
        form.setValue("name", scrapedData.name);
      }
      if (scrapedData.location && !form.getValues("location")) {
        form.setValue("location", scrapedData.location);
      }
      if (scrapedData.start_date && !form.getValues("start_date")) {
        form.setValue("start_date", scrapedData.start_date);
      }
      if (scrapedData.end_date && !form.getValues("end_date")) {
        form.setValue("end_date", scrapedData.end_date);
      }
      // Price is not auto-filled from scraped data - user must enter manually
      if (scrapedData.description && !form.getValues("notes")) {
        form.setValue("notes", scrapedData.description);
      }
      
      setLastScrapedUrl(url);
      toast.success("Event details scraped and filled automatically!");
    } catch (error) {
      // Silently fail - user can still manually fill the form
      console.error("Failed to scrape event:", error);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Event Link - Always visible at top */}
        <FormField
          control={form.control}
          name="event_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Event Link
                {isScraping && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="https://example.com/event"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      // Clear previous timeout
                      if (scrapeTimeoutRef.current) {
                        clearTimeout(scrapeTimeoutRef.current);
                      }
                      // Trigger scraping when URL is pasted/entered
                      const url = e.target.value;
                      if (url && url.match(/^https?:\/\//i)) {
                        // Debounce the scraping (wait 1.5 seconds after user stops typing)
                        scrapeTimeoutRef.current = setTimeout(() => {
                          handleUrlChange(url);
                        }, 1500);
                      }
                    }}
                    disabled={isScraping}
                    className={isScraping ? "pr-9" : ""}
                  />
                  {isScraping && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
              {isScraping && (
                <p className="text-xs text-muted-foreground">
                  Scraping event details...
                </p>
              )}
            </FormItem>
          )}
        />

        {/* Section 1: Event Details */}
        <Collapsible
          open={openSections.eventDetails}
          onOpenChange={(open) => setOpenSections({ ...openSections, eventDetails: open })}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-left font-semibold hover:bg-muted transition-colors">
            <span>Event Details <span className="text-destructive">*</span></span>
            {openSections.eventDetails ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conference Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="React Conf 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Partnership */}
            <FormField
              control={form.control}
              name="partnership"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partnership</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      value={field.value || ""}
                      rows={2}
                      placeholder="Enter partnership note..."
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Section 2: Knightec Info */}
        <Collapsible
          open={openSections.knightecInfo}
          onOpenChange={(open) => setOpenSections({ ...openSections, knightecInfo: open })}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-left font-semibold hover:bg-muted transition-colors">
            <span>Knightec Info <span className="text-destructive">*</span></span>
            {openSections.knightecInfo ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Office Search */}
            <OfficeSearch
              offices={offices}
              selectedOffices={selectedOffices}
              onToggleOffice={handleOfficeToggle}
            />

            {/* Category Search */}
            <CategorySearch
              categories={categories}
              selectedCategories={selectedCategories}
              onToggleCategory={handleCategoryToggle}
            />

            {/* Assigned To */}
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To *</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a person" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden category field - value is set by CategorySearch component */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="hidden" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Section 3: Date and Price */}
        <Collapsible
          open={openSections.datePrice}
          onOpenChange={(open) => setOpenSections({ ...openSections, datePrice: open })}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-left font-semibold hover:bg-muted transition-colors">
            <span>Date and Price</span>
            {openSections.datePrice ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Currency and Price */}
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select 
                      value={currency} 
                      onValueChange={(value) => {
                        setCurrency(value);
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SEK">SEK</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="NOK">NOK</SelectItem>
                        <SelectItem value="DKK">DKK</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        {...field}
                        value={field.value === "0" || field.value === "" ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? "0" : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fee Link */}
            <FormField
              control={form.control}
              name="fee_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Link</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/registration"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee (note about fee) */}
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      value={field.value || ""}
                      rows={2}
                      placeholder="Enter note about fee..."
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start and End Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reason to Go Field */}
            <FormField
              control={form.control}
              name="reason_to_go"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason to Go (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      value={field.value || ""}
                      rows={2}
                      maxLength={500}
                      placeholder="Enter reason to attend this event..."
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Brief reason for attending this conference (2 lines max)
                  </p>
                </FormItem>
              )}
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Section 4: Ratings */}
        <Collapsible
          open={openSections.ratings}
          onOpenChange={(open) => setOpenSections({ ...openSections, ratings: open })}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-muted/50 px-4 py-3 text-left font-semibold hover:bg-muted transition-colors">
            <span>Ratings</span>
            {openSections.ratings ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="accessibility_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accessibility</FormLabel>
                    <FormControl>
                      <RatingInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skill_improvement_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Improvement</FormLabel>
                    <FormControl>
                      <RatingInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="finding_partners_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Finding Partners</FormLabel>
                    <FormControl>
                      <RatingInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Hidden status field - not shown in form */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hidden notes field - not shown in form */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting || !isFormValid} 
            className="bg-[#FFA600] text-white hover:bg-[#FFA600]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form.formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
        {!isFormValid && (
          <p className="text-xs text-muted-foreground text-right mt-2">
            Please complete all mandatory sections: Event Details and Knightec Info
          </p>
        )}
      </form>
    </Form>
  );
}
