"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ConferenceList } from "@/components/ConferenceList";
import { FilterBar } from "@/components/FilterBar";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { StatsCard } from "@/components/StatsCard";
import { getAllConferences, getAllPeople, getUniqueCategories } from "@/lib/db";
import type { Conference, Person, ConferenceFilters } from "@/types";
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";

export default function Home() {
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<ConferenceFilters>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [conferencesData, peopleData, categoriesData] = await Promise.all([
        getAllConferences(),
        getAllPeople(),
        getUniqueCategories(),
      ]);
      setConferences(conferencesData);
      setPeople(peopleData);
      setCategories(categoriesData);
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

    // Search filter (name or location)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.location.toLowerCase().includes(searchLower)
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

    // Status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    // Price range filter
    if (filters.price_min !== undefined) {
      filtered = filtered.filter((c) => c.price >= filters.price_min!);
    }
    if (filters.price_max !== undefined) {
      filtered = filtered.filter((c) => c.price <= filters.price_max!);
    }

    return filtered;
  }, [conferences, filters]);

  const uniqueStatuses = useMemo(() => {
    const statuses = conferences
      .map((c) => c.status)
      .filter((s): s is string => s !== null);
    return [...new Set(statuses)];
  }, [conferences]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPrice = conferences.reduce((sum, c) => sum + c.price, 0);
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);
    const upcomingConferences = conferences.filter((c) => {
      if (!c.start_date) return false;
      try {
        const startDate = parseISO(c.start_date);
        return isAfter(startDate, now) && isBefore(startDate, thirtyDaysFromNow);
      } catch {
        return false;
      }
    });

    return {
      totalConferences: conferences.length,
      totalPeople: people.length,
      totalBudget: totalPrice,
      upcoming: upcomingConferences.length,
    };
  }, [conferences, people]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Conference Dashboard</h1>
        <p className="text-muted-foreground text-base">
          Track and manage events
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatsCard
          title="Total Conferences"
          value={stats.totalConferences}
          icon={Calendar}
          description="All conferences"
        />
        <StatsCard
          title="Total People"
          value={stats.totalPeople}
          icon={Users}
          description="Team members"
        />
        <StatsCard
          title="Upcoming"
          value={stats.upcoming}
          icon={TrendingUp}
          description="Next 30 days"
        />
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        people={people}
        statuses={uniqueStatuses}
      />

      {/* Conferences List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Conferences <span className="text-muted-foreground font-normal">({filteredConferences.length})</span>
          </h2>
        </div>
        <ConferenceList conferences={filteredConferences} people={people} />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        people={people}
        onPersonAdded={loadData}
        onConferenceAdded={loadData}
      />
    </div>
  );
}
