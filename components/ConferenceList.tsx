"use client";

import { ConferenceCard } from "./ConferenceCard";
import type { Conference, Person } from "@/types";
import { Calendar } from "lucide-react";

interface ConferenceListProps {
  conferences: Conference[];
  people: Person[];
}

export function ConferenceList({ conferences, people }: ConferenceListProps) {
  const peopleMap = new Map(people.map((p) => [p.id, p]));

  if (conferences.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/30">
        <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-5">
          <Calendar className="h-10 w-10 text-primary" />
        </div>
        <p className="text-foreground text-lg font-semibold mb-2">
          No conferences found
        </p>
        <p className="text-muted-foreground text-sm">
          Get started by adding your first conference using the + button
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {conferences.map((conference) => (
        <ConferenceCard
          key={conference.id}
          conference={conference}
          person={conference.assigned_to ? peopleMap.get(conference.assigned_to) : null}
        />
      ))}
    </div>
  );
}
