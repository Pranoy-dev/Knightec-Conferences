"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ConferenceFilters } from "@/types";
import { X, ChevronDown, Filter } from "lucide-react";
import type { Person } from "@/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  filters: ConferenceFilters;
  onFiltersChange: (filters: ConferenceFilters) => void;
  categories: string[];
  people: Person[];
  statuses: string[];
}

export function FilterBar({
  filters,
  onFiltersChange,
  categories,
  people,
  statuses,
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof ConferenceFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value || undefined,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;
  const activeFilterCount = Object.keys(filters).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 h-auto hover:bg-accent/50 transition-colors rounded-md text-sm font-medium cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-300 ease-in-out",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="px-4 pb-5 space-y-5 pt-2">
          {/* Active Filters Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {filters.search}
                  <button
                    onClick={() => updateFilter("search", undefined)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.category && filters.category !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Category: {filters.category}
                  <button
                    onClick={() => updateFilter("category", undefined)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.assigned_to && filters.assigned_to !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Assigned: {people.find((p) => p.id === filters.assigned_to)?.name}
                  <button
                    onClick={() => updateFilter("assigned_to", undefined)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.status && filters.status !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {filters.status}
                  <button
                    onClick={() => updateFilter("status", undefined)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Filter Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground">Search</label>
              <Input
                placeholder="Search name or location..."
                value={filters.search || ""}
                onChange={(e) => updateFilter("search", e.target.value)}
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground">Category</label>
              <Select
                value={filters.category || "all"}
                onValueChange={(value) => updateFilter("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground">Assigned To</label>
              <Select
                value={filters.assigned_to || "all"}
                onValueChange={(value) => updateFilter("assigned_to", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All people" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All people</SelectItem>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
