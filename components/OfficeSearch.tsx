"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface Office {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface OfficeSearchProps {
  offices: Office[];
  selectedOffices: string[];
  onToggleOffice: (officeName: string) => void | Promise<void>;
}

export function OfficeSearch({
  offices,
  selectedOffices,
  onToggleOffice,
}: OfficeSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper function to check if office is selected
  const isSelected = (officeName: string) => {
    return selectedOffices.some(
      (office) => office.toLowerCase() === officeName.toLowerCase()
    );
  };

  // Filter offices for autocomplete suggestions (only unselected ones)
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const query = searchQuery.toLowerCase();
    return offices
      .filter((office) => {
        const matches = office.name.toLowerCase().includes(query);
        const isAlreadySelected = selectedOffices.some(
          (selected) => selected.toLowerCase() === office.name.toLowerCase()
        );
        return matches && !isAlreadySelected;
      })
      .slice(0, 5); // Limit to 5 suggestions
  }, [offices, searchQuery, selectedOffices]);

  // Filter offices based on search query
  // When no search query, show only selected offices
  // When searching, show filtered results
  const filteredOffices = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show only selected offices when no search
      return offices.filter((office) => 
        selectedOffices.some(
          (selected) => selected.toLowerCase() === office.name.toLowerCase()
        )
      );
    }
    const query = searchQuery.toLowerCase();
    return offices.filter((office) =>
      office.name.toLowerCase().includes(query)
    );
  }, [offices, searchQuery, selectedOffices]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  const handleOfficeClick = async (officeName: string) => {
    await onToggleOffice(officeName);
    setSearchQuery("");
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleCreateNew = async () => {
    if (searchQuery.trim()) {
      const officeExists = offices.some(
        (office) => office.name.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (!officeExists) {
        // Use onToggleOffice which will create the office if it doesn't exist
        await onToggleOffice(searchQuery.trim());
        setSearchQuery("");
      }
    }
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Office</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search offices..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(e.target.value.trim().length > 0);
            }}
            onFocus={() => {
              if (searchQuery.trim().length > 0) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                e.preventDefault();
                if (autocompleteSuggestions.length > 0) {
                  // Select first suggestion
                  handleOfficeClick(autocompleteSuggestions[0].name);
                } else {
                  handleCreateNew();
                }
              }
              if (e.key === "Escape") {
                setShowSuggestions(false);
                inputRef.current?.blur();
              }
            }}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setShowSuggestions(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showSuggestions && autocompleteSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[200px] overflow-y-auto">
              {autocompleteSuggestions.map((office) => (
                <button
                  key={office.id}
                  type="button"
                  onClick={() => handleOfficeClick(office.name)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-md last:rounded-b-md"
                >
                  {office.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {searchQuery.trim() &&
          !filteredOffices.some(
            (office) => office.name.toLowerCase() === searchQuery.trim().toLowerCase()
          ) && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="text-xs text-primary hover:underline"
            >
              Create "{searchQuery.trim()}"
            </button>
          )}
      </div>

      {/* Show selected offices when not searching, or filtered results when searching */}
      {filteredOffices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filteredOffices.map((office) => {
            const selected = isSelected(office.name);
            return (
              <Badge
                key={office.id}
                variant={selected ? "default" : "outline"}
                className={selected ? "cursor-pointer bg-[#FFA600] text-white hover:bg-[#FFA600]/90 transition-colors" : "cursor-pointer hover:bg-primary/10 transition-colors"}
                onClick={() => handleOfficeClick(office.name)}
              >
                {office.name}
                {selected && <span className="ml-1 text-xs">✓</span>}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
