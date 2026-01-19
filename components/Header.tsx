"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Globe, Loader2 } from "lucide-react";
import { KnightecLogo } from "./KnightecLogo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AddConferenceForm } from "./AddConferenceForm";
import { getAllPeople, getAllCategories, createCategory, getAllOffices, createOffice } from "@/lib/db";
import type { Person, Category, Office } from "@/types";
import { useEffect } from "react";
import type { ScrapedEventData } from "@/lib/scrape-event";

export function Header() {
  const [url, setUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedEventData | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingOffice, setIsCreatingOffice] = useState(false);

  // Function to load categories, offices, and people
  const loadData = async () => {
    try {
      const [peopleData, categoriesData, officesData] = await Promise.all([
        getAllPeople(),
        getAllCategories(),
        getAllOffices(),
      ]);
      setPeople(peopleData);
      setCategories(categoriesData);
      setOffices(officesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh categories when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Handle category toggle - create if doesn't exist, toggle selection
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
          // Refresh categories from database to ensure we have the latest list
          await loadData();
          categoryToUse = categories.find(
            (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
          ) || newCategory;
          toast.success(`Category "${categoryName}" created successfully!`);
        } catch (error) {
          // If creation fails (e.g., already exists), refresh and try to find it again
          await loadData();
          const found = categories.find(
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
      const updatedCategories = selectedCategories.includes(categoryNameToUse)
        ? selectedCategories.filter((cat) => cat !== categoryNameToUse)
        : [...selectedCategories, categoryNameToUse];
      
      setSelectedCategories(updatedCategories);
      
      // Force form update by updating the key
      // The form will re-render with the new category value
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create category";
      toast.error(errorMessage);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Reset selected categories and offices when scraped data changes (new scrape)
  useEffect(() => {
    if (scrapedData) {
      // Always reset to empty - don't preselect categories or offices
      setSelectedCategories([]);
      setSelectedOffices([]);
    } else {
      // Clear selections when scraped data is cleared
      setSelectedCategories([]);
      setSelectedOffices([]);
    }
  }, [scrapedData?.name, scrapedData?.url]); // Use specific fields to detect new scrape

  // Handle office toggle - create if doesn't exist
  const handleOfficeToggle = async (officeName: string) => {
    if (isCreatingOffice) return;

    setIsCreatingOffice(true);
    try {
      let officeToUse = offices.find(
        (office) => office.name.toLowerCase() === officeName.toLowerCase()
      );

      if (!officeToUse) {
        try {
          const newOffice = await createOffice({ name: officeName });
          setOffices([...offices, newOffice]);
          officeToUse = newOffice;
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

      const officeNameToUse = officeToUse.name;
      // Single selection for office
      setSelectedOffices((prev) => {
        if (prev.includes(officeNameToUse)) {
          return [];
        } else {
          return [officeNameToUse];
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create office";
      toast.error(errorMessage);
    } finally {
      setIsCreatingOffice(false);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setIsScraping(true);
    // Reset previous scraped data, selected categories/offices, and hide form
    setScrapedData(null);
    setSelectedCategories([]);
    setSelectedOffices([]);
    setShowForm(false);
    
    try {
      // Refresh categories before scraping to ensure we have the latest list
      await loadData();
      
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
      // Set new scraped data - this will trigger the form to show with fresh data
      setScrapedData(result.data);
      setShowForm(true);
      toast.success("Event data scraped successfully!");
      
      // Refresh categories again after scraping to catch any new ones
      await loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to scrape event";
      toast.error(errorMessage);
      // Make sure to reset state on error
      setScrapedData(null);
      setSelectedCategories([]);
      setSelectedOffices([]);
      setShowForm(false);
    } finally {
      setIsScraping(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setScrapedData(null);
    setUrl("");
    setSelectedCategories([]);
    setIsOpen(false);
    // Reload all data including categories
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setScrapedData(null);
    setUrl("");
    setSelectedCategories([]);
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setShowForm(false);
      setScrapedData(null);
      setUrl("");
      setSelectedCategories([]);
      // Refresh categories when dialog closes
      loadData();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-white/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/50 backdrop-saturate-150 shadow-lg shadow-black/5">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <KnightecLogo className="h-10 transition-transform group-hover:scale-105" />
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            <Link href="/data">
              <Button variant="outline" className="gap-2 shadow-sm hover:shadow-md transition-shadow bg-white/80 border-border/40 hover:bg-white/90">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Data</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
