"use client";

import { useState } from "react";
import { ConferenceCard } from "./ConferenceCard";
import { ConferenceDetailsModal } from "./ConferenceDetailsModal";
import type { Conference, Person, Office } from "@/types";
import { Calendar } from "lucide-react";

interface ConferenceListProps {
  conferences: Conference[];
  people: Person[];
  offices: Office[];
  onUpdate?: () => void;
}

export function ConferenceList({ conferences, people, offices, onUpdate }: ConferenceListProps) {
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const peopleMap = new Map(people.map((p) => [p.id, p]));
  const officesMap = new Map(offices.map((o) => [o.id, o]));
  
  // Get office by office_id
  const getOfficeForConference = (conference: Conference): Office | null => {
    if (conference.office_id) {
      return officesMap.get(conference.office_id) || null;
    }
    return null;
  };

  const handleCardClick = (conference: Conference) => {
    setSelectedConference(conference);
  };

  const handleCloseModal = () => {
    setSelectedConference(null);
  };

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conferences.map((conference) => (
          <ConferenceCard
            key={conference.id}
            conference={conference}
            person={conference.assigned_to ? peopleMap.get(conference.assigned_to) : null}
            office={getOfficeForConference(conference)}
            onClick={() => handleCardClick(conference)}
          />
        ))}
      </div>

      {selectedConference && (
        <ConferenceDetailsModal
          conference={selectedConference}
          person={selectedConference.assigned_to ? peopleMap.get(selectedConference.assigned_to) : null}
          office={getOfficeForConference(selectedConference)}
          people={people}
          onClose={handleCloseModal}
          onUpdate={() => {
            handleCloseModal();
            onUpdate?.();
          }}
        />
      )}
    </>
  );
}
