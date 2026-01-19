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
import { createConference, getAllCategories } from "@/lib/db";
import { toast } from "sonner";
import type { Person, Category } from "@/types";
import { useEffect, useState } from "react";

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
}

export function AddConferenceForm({ people, onSuccess, onCancel }: AddConferenceFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  // Use explicit input/output types for type safety with zodResolver
  // Input type: what form fields are (strings from HTML inputs, or numbers from form state)
  // Output type: what we get after validation (numbers)
  type FormInput = FormInputType<typeof conferenceSchema>;
  type FormOutput = FormOutputType<typeof conferenceSchema>;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(conferenceSchema),
    defaultValues: {
      name: "",
      location: "",
      category: "",
      price: "", // String input (HTML input type) - will be transformed to number
      assigned_to: "",
      start_date: "",
      end_date: "",
      event_link: "",
      notes: "",
      status: undefined,
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

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
      await createConference(data);
      toast.success("Conference added successfully!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add conference";
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No categories available. Add one first.
                      </div>
                    ) : (
                      categories
                        .filter((category) => category.name && category.name.trim() !== "")
                        .map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))
                    )}
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
              <FormItem>
                <FormLabel>Price *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={typeof field.value === "number" ? field.value : field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Keep as string (input type) - zodResolver will transform to number
                      field.onChange(value === "" ? "" : value);
                    }}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a person" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name} ({person.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="event_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Link</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Additional notes..."
                  {...field}
                />
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
          <Button type="submit" disabled={form.formState.isSubmitting} className="text-white">
            {form.formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
