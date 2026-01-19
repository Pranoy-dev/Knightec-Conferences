"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import type { ConferenceFilters } from "@/types";
import { X } from "lucide-react";
import { useMemo } from "react";
import type { Person, Office } from "@/types";

interface FilterBarProps {
  filters: ConferenceFilters;
  onFiltersChange: (filters: ConferenceFilters) => void;
  categories: string[];
  people: Person[];
  offices: Office[];
}

export function FilterBar({
  filters,
  onFiltersChange,
  categories,
  people,
  offices,
}: FilterBarProps) {
  const updateFilter = (key: keyof ConferenceFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" || value === "" ? undefined : value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = 
    (filters.office && filters.office !== "all") ||
    (filters.category && filters.category !== "all") ||
    (filters.assigned_to && filters.assigned_to !== "all");

  // Prepare options for searchable selects
  const officeOptions = useMemo<SearchableSelectOption[]>(() => {
    return [
      { value: "all", label: "All offices" },
      ...offices.map((office) => ({
        value: office.id,
        label: office.name,
      })),
    ];
  }, [offices]);

  const categoryOptions = useMemo<SearchableSelectOption[]>(() => {
    return [
      { value: "all", label: "All categories" },
      ...categories.map((category) => ({
        value: category,
        label: category,
      })),
    ];
  }, [categories]);

  const peopleOptions = useMemo<SearchableSelectOption[]>(() => {
    return [
      { value: "all", label: "All people" },
      ...people.map((person) => ({
        value: person.id,
        label: person.name,
      })),
    ];
  }, [people]);

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Office Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Office
          </label>
          <SearchableSelect
            options={officeOptions}
            value={filters.office || "all"}
            onValueChange={(value) => updateFilter("office", value)}
            placeholder="All offices"
            searchPlaceholder="Search offices..."
            className="w-full"
          />
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Category
          </label>
          <SearchableSelect
            options={categoryOptions}
            value={filters.category || "all"}
            onValueChange={(value) => updateFilter("category", value)}
            placeholder="All categories"
            searchPlaceholder="Search categories..."
            className="w-full"
          />
        </div>

        {/* Assigned To Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Assigned To
          </label>
          <SearchableSelect
            options={peopleOptions}
            value={filters.assigned_to || "all"}
            onValueChange={(value) => updateFilter("assigned_to", value)}
            placeholder="All people"
            searchPlaceholder="Search people..."
            className="w-full"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 text-sm"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.office && filters.office !== "all" && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              Office: {offices.find((o) => o.id === filters.office)?.name || filters.office}
              <button
                onClick={() => updateFilter("office", undefined)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 -mr-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.category && filters.category !== "all" && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              Category: {filters.category}
              <button
                onClick={() => updateFilter("category", undefined)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 -mr-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.assigned_to && filters.assigned_to !== "all" && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
              Assigned: {people.find((p) => p.id === filters.assigned_to)?.name}
              <button
                onClick={() => updateFilter("assigned_to", undefined)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 -mr-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
