"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddConferenceForm } from "./AddConferenceForm";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateRange } from "@/lib/format";
import type { Conference, Person, Office, Category } from "@/types";
import { MapPin, Tag, User, Calendar, DollarSign, ExternalLink, FileText, Edit } from "lucide-react";

interface ConferenceDetailsModalProps {
  conference: Conference;
  person?: Person | null;
  office?: Office | null;
  people: Person[];
  onClose: () => void;
  onUpdate?: () => void;
}

export function ConferenceDetailsModal({
  conference,
  person,
  office,
  people,
  onClose,
  onUpdate,
}: ConferenceDetailsModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    setIsEditMode(false);
    onUpdate?.();
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  if (isEditMode) {
    // Parse category string (may be comma-separated) for selectedCategories
    const selectedCategories = conference.category
      ? conference.category.split(",").map((c) => c.trim()).filter(Boolean)
      : [];
    
    // Use office name from location if office exists, otherwise empty array
    const selectedOffices = office ? [office.name] : [];

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Conference</DialogTitle>
            <DialogDescription>
              Update the conference details below.
            </DialogDescription>
          </DialogHeader>
          <AddConferenceForm
            people={people}
            initialData={{
              name: conference.name,
              location: conference.location,
              category: conference.category,
              price: conference.price,
              assigned_to: conference.assigned_to || "",
              start_date: conference.start_date || "",
              end_date: conference.end_date || "",
              event_link: conference.event_link || "",
              notes: conference.notes || "",
              status: conference.status || undefined,
            }}
            selectedCategories={selectedCategories}
            selectedOffices={selectedOffices}
            conferenceId={conference.id}
            onSuccess={handleSave}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{conference.name}</DialogTitle>
          <DialogDescription>
            Conference event details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Office Badge */}
          {office && (
            <div>
              <Badge variant="default" className="text-sm px-3 py-1">
                {office.name}
              </Badge>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(conference.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                {conference.location}
              </a>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span className="text-sm font-medium">Category</span>
              </div>
              <Badge variant="outline">{conference.category}</Badge>
            </div>

            {/* Assigned To */}
            {person && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Assigned To</span>
                </div>
                <p className="text-sm font-medium">{person.name}</p>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Price</span>
              </div>
              <p className="text-sm font-medium">{formatCurrency(conference.price)}</p>
            </div>

            {/* Dates */}
            {(conference.start_date || conference.end_date) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Date</span>
                </div>
                <p className="text-sm font-medium">
                  {formatDateRange(conference.start_date, conference.end_date)}
                </p>
              </div>
            )}

            {/* Status */}
            {conference.status && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm font-medium">Status</span>
                </div>
                <Badge variant="outline">{conference.status}</Badge>
              </div>
            )}
          </div>

          {/* Event Link */}
          {conference.event_link && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm font-medium">Event Link</span>
              </div>
              <a
                href={conference.event_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
              >
                {conference.event_link}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Notes */}
          {conference.notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Notes</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{conference.notes}</p>
            </div>
          )}

          {/* Edit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
