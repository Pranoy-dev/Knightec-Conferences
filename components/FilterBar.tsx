"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import type { ConferenceFilters } from "@/types";
import { X, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { useMemo } from "react";
import type { Person, Office } from "@/types";

interface FilterBarProps {
  filters: ConferenceFilters;
  onFiltersChange: (filters: ConferenceFilters) => void;
  categories: string[];
  people: Person[];
  offices: Office[];
  dateSortOrder?: "off" | "asc" | "desc";
  onDateSortOrderChange?: (order: "off" | "asc" | "desc") => void;
}

export function FilterBar({
  filters,
  onFiltersChange,
  categories,
  people,
  offices,
  dateSortOrder = "off",
  onDateSortOrderChange,
}: FilterBarProps) {
  const cycleDateSort = () => {
    if (!onDateSortOrderChange) return;
    if (dateSortOrder === "off") onDateSortOrderChange("asc");
    else if (dateSortOrder === "asc") onDateSortOrderChange("desc");
    else onDateSortOrderChange("off");
  };
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
        <div className="flex-1 min-w-[200px] group">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Office
          </label>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative backdrop-blur-sm bg-background/80 border border-border/50 rounded-lg p-1 shadow-[4px_0_12px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[6px_0_16px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-primary/30">
              <SearchableSelect
                options={officeOptions}
                value={filters.office || "all"}
                onValueChange={(value) => updateFilter("office", value)}
                placeholder="All offices"
                searchPlaceholder="Search offices..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-[200px] group">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Category
          </label>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative backdrop-blur-sm bg-background/80 border border-border/50 rounded-lg p-1 shadow-[4px_0_12px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[6px_0_16px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-primary/30">
              <SearchableSelect
                options={categoryOptions}
                value={filters.category || "all"}
                onValueChange={(value) => updateFilter("category", value)}
                placeholder="All categories"
                searchPlaceholder="Search categories..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Assigned To Filter */}
        <div className="flex-1 min-w-[200px] group">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Assigned To
          </label>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative backdrop-blur-sm bg-background/80 border border-border/50 rounded-lg p-1 shadow-[4px_0_12px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[6px_0_16px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-primary/30">
              <SearchableSelect
                options={peopleOptions}
                value={filters.assigned_to || "all"}
                onValueChange={(value) => updateFilter("assigned_to", value)}
                placeholder="All people"
                searchPlaceholder="Search people..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Sort by Date Button */}
        {onDateSortOrderChange && (
          <Button
            variant="outline"
            size="sm"
            aria-pressed={dateSortOrder !== "off"}
            aria-label={
              dateSortOrder === "off"
                ? "Date"
                : dateSortOrder === "asc"
                  ? "Date ascending (today to future)"
                  : "Date descending"
            }
            onClick={cycleDateSort}
            data-sort-by-date-button
            className="h-10 text-sm gap-2 backdrop-blur-sm bg-background/60 border border-border/50 shadow-[2px_0_8px_rgba(0,0,0,0.06)] hover:shadow-[4px_0_12px_rgba(0,0,0,0.1)] hover:bg-background/80 transition-all duration-300"
          >
            <Calendar className="h-4 w-4" aria-hidden />
            Date
            {dateSortOrder === "asc" && (
              <ArrowUp className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {dateSortOrder === "desc" && (
              <ArrowDown className="h-4 w-4 shrink-0" aria-hidden />
            )}
          </Button>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 text-sm backdrop-blur-sm bg-background/60 border border-border/50 shadow-[2px_0_8px_rgba(0,0,0,0.06)] hover:shadow-[4px_0_12px_rgba(0,0,0,0.1)] hover:bg-background/80 transition-all duration-300"
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
