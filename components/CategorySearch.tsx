"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import type { Category } from "@/types";

interface CategorySearchProps {
  categories: Category[];
  selectedCategories: string[];
  onToggleCategory: (categoryName: string) => void | Promise<void>;
}

export function CategorySearch({
  categories,
  selectedCategories,
  onToggleCategory,
}: CategorySearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Helper function to check if category is selected
  const isSelected = (categoryName: string) => {
    return selectedCategories.some(
      (cat) => cat.toLowerCase() === categoryName.toLowerCase()
    );
  };

  // Filter categories for autocomplete suggestions (only unselected ones)
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const query = searchQuery.toLowerCase();
    return categories
      .filter((cat) => {
        const matches = cat.name.toLowerCase().includes(query);
        const isAlreadySelected = selectedCategories.some(
          (selected) => selected.toLowerCase() === cat.name.toLowerCase()
        );
        return matches && !isAlreadySelected;
      })
      .slice(0, 5); // Limit to 5 suggestions
  }, [categories, searchQuery, selectedCategories]);

  // Filter categories based on search query
  // When no search query, show only selected categories
  // When searching, show filtered results
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show only selected categories when no search
      return categories.filter((cat) => 
        selectedCategories.some(
          (selected) => selected.toLowerCase() === cat.name.toLowerCase()
        )
      );
    }
    const query = searchQuery.toLowerCase();
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(query)
    );
  }, [categories, searchQuery, selectedCategories]);

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

  const handleCategoryClick = async (categoryName: string) => {
    await onToggleCategory(categoryName);
    setSearchQuery("");
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleCreateNew = async () => {
    if (searchQuery.trim()) {
      const categoryExists = categories.some(
        (cat) => cat.name.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (!categoryExists) {
        // Use onToggleCategory which will create the category if it doesn't exist
        await onToggleCategory(searchQuery.trim());
        setSearchQuery("");
      }
    }
  };

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="space-y-2">
        <label className="text-sm font-medium">Categories</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search categories..."
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
                  handleCategoryClick(autocompleteSuggestions[0].name);
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
              {autocompleteSuggestions.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryClick(category.name)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-md last:rounded-b-md"
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
        {searchQuery.trim() &&
          !filteredCategories.some(
            (cat) => cat.name.toLowerCase() === searchQuery.trim().toLowerCase()
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

      {/* Show selected categories when not searching, or filtered results when searching */}
      {filteredCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filteredCategories.map((category) => {
            const selected = isSelected(category.name);
            return (
              <Badge
                key={category.id}
                variant={selected ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.name}
                {selected && <span className="ml-1 text-xs">✓</span>}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
