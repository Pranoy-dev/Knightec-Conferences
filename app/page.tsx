"use client";

import { useEffect, useState, useMemo } from "react";
import { ConferenceList } from "@/components/ConferenceList";
import { FilterBar } from "@/components/FilterBar";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { getAllConferences, getAllPeople, getUniqueCategories, getAllOffices } from "@/lib/db";
import { exportConferencesToExcel } from "@/lib/export";
import type { ConferenceWithRating, Person, ConferenceFilters, Office } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Home() {
  const [conferences, setConferences] = useState<ConferenceWithRating[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [filters, setFilters] = useState<ConferenceFilters>({});
  const [dateSortOrder, setDateSortOrder] = useState<"off" | "asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [conferencesData, peopleData, categoriesData, officesData] = await Promise.all([
        getAllConferences(),
        getAllPeople(),
        getUniqueCategories(),
        getAllOffices(),
      ]);
      setConferences(conferencesData);
      setPeople(peopleData);
      setCategories(categoriesData);
      setOffices(officesData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load data";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredConferences = useMemo(() => {
    let filtered = [...conferences];

    // Office filter (matching by office_id)
    if (filters.office && filters.office !== "all") {
      filtered = filtered.filter(
        (c) => c.office_id === filters.office
      );
    }

    // Category filter
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((c) => c.category === filters.category);
    }

    // Assigned to filter
    if (filters.assigned_to && filters.assigned_to !== "all") {
      filtered = filtered.filter((c) => c.assigned_to === filters.assigned_to);
    }

    // Sort by date (from today onwards)
    if (dateSortOrder !== "off") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ascending = dateSortOrder === "asc";

      filtered = filtered
        .filter((c) => {
          if (!c.start_date) return false;
          const startDate = new Date(c.start_date);
          startDate.setHours(0, 0, 0, 0);
          return startDate >= today;
        })
        .sort((a, b) => {
          const dateA = a.start_date ? new Date(a.start_date).getTime() : Infinity;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : Infinity;
          return ascending ? dateA - dateB : dateB - dateA;
        });
    }

    return filtered;
  }, [conferences, filters, offices, dateSortOrder]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleExport = async () => {
    try {
      await exportConferencesToExcel(filteredConferences, people, offices);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to export data";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-6 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Conferences</h1>
          <p className="text-muted-foreground text-sm">
            Manage and filter your conference events
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="gap-2 shadow-sm hover:shadow-md transition-shadow bg-white/80 border-border/40 hover:bg-white/90"
          disabled={filteredConferences.length === 0}
        >
          <Download className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        people={people}
        offices={offices}
        dateSortOrder={dateSortOrder}
        onDateSortOrderChange={setDateSortOrder}
      />

      {/* Conferences List */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {filteredConferences.length} {filteredConferences.length === 1 ? "conference" : "conferences"}
          </h2>
        </div>
        <ConferenceList 
          conferences={filteredConferences} 
          people={people} 
          offices={offices}
          onUpdate={loadData}
        />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        people={people}
        onPersonAdded={loadData}
        onConferenceAdded={loadData}
        onCategoryAdded={loadData}
      />
    </div>
  );
}
