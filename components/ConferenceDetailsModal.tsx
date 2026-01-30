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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatDateRange } from "@/lib/format";
import type { ConferenceWithRating, Person, Office, Category } from "@/types";
import { MapPin, Tag, User, Calendar, Ticket, ExternalLink, Edit, Star } from "lucide-react";
import { RatingDisplay } from "@/components/ui/rating-display";

interface ConferenceDetailsModalProps {
  conference: ConferenceWithRating;
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
    
    // Use office name if office exists, otherwise empty array
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
              currency: conference.currency || "SEK",
              assigned_to: conference.assigned_to || "",
              start_date: conference.start_date || "",
              end_date: conference.end_date || "",
              event_link: conference.event_link || "",
              notes: conference.notes || "",
              status: conference.status || undefined,
              accessibility_rating: conference.rating?.accessibility_rating ?? null,
              skill_improvement_rating: conference.rating?.skill_improvement_rating ?? null,
              finding_partners_rating: conference.rating?.finding_partners_rating ?? null,
              reason_to_go: conference.reason_to_go ?? null,
              fee_link: conference.fee_link || "",
              partnership: conference.partnership || "",
              fee: conference.fee || "",
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

  const fieldLabelClass = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";
  const fieldValueClass = "text-sm text-foreground leading-relaxed";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="space-y-1.5 pb-6 border-b">
          <DialogTitle className="text-2xl font-bold tracking-tight">{conference.name}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Conference event details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* Section: Event info */}
          <section className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Event info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <p className={fieldLabelClass}>
                  <MapPin className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" aria-hidden />
                  Location
                </p>
                {conference.location ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(conference.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${fieldValueClass} text-primary hover:underline block break-words`}
                  >
                    {conference.location}
                  </a>
                ) : (
                  <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                )}
              </div>

              <div className="space-y-1.5">
                <p className={fieldLabelClass}>Office</p>
                {office ? (
                  <Badge variant="default" className="bg-[#FFA600] text-white hover:bg-[#FFA600]/90 font-medium">
                    {office.name}
                  </Badge>
                ) : (
                  <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                )}
              </div>

              <div className="space-y-1.5">
                <p className={fieldLabelClass}>
                  <Tag className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" aria-hidden />
                  Category
                </p>
                {conference.category ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="font-normal cursor-help">
                        {conference.category.length > 33
                          ? `${conference.category.slice(0, 33)}...`
                          : conference.category}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-sm">
                      {conference.category}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                )}
              </div>

              <div className="space-y-1.5">
                <p className={fieldLabelClass}>
                  <User className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" aria-hidden />
                  Assigned to
                </p>
                <p className={person ? fieldValueClass : `${fieldValueClass} text-muted-foreground`}>
                  {person ? person.name : "—"}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className={fieldLabelClass}>
                  <Ticket className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" aria-hidden />
                  Price
                </p>
                <p className={fieldValueClass}>{formatCurrency(conference.price, conference.currency || "SEK")}</p>
              </div>

              <div className="space-y-1.5">
                <p className={fieldLabelClass}>
                  <Calendar className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" aria-hidden />
                  Date
                </p>
                <p className={(conference.start_date || conference.end_date) ? fieldValueClass : `${fieldValueClass} text-muted-foreground`}>
                  {(conference.start_date || conference.end_date)
                    ? formatDateRange(conference.start_date, conference.end_date)
                    : "—"}
                </p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <p className={fieldLabelClass}>Status</p>
                {conference.status ? (
                  <Badge variant="outline" className="font-normal">{conference.status}</Badge>
                ) : (
                  <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                )}
              </div>
            </div>
          </section>

          {/* Section: Links & description */}
          <section className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Links & description</h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <p className={fieldLabelClass}>
                  <ExternalLink className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" aria-hidden />
                  Event link
                </p>
                {conference.event_link ? (
                  <a
                    href={conference.event_link.split(/\s+/)[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${fieldValueClass} text-primary hover:underline break-all block`}
                  >
                    {conference.event_link}
                    <ExternalLink className="inline h-3 w-3 ml-1 shrink-0" aria-hidden />
                  </a>
                ) : (
                  <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                )}
              </div>

              <div className="space-y-1.5">
                <p className={fieldLabelClass}>Notes</p>
                {conference.notes ? (
                  <p className={`${fieldValueClass} whitespace-pre-line`}>{conference.notes}</p>
                ) : (
                  <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                )}
              </div>

              <div className="space-y-1.5">
                <p className={fieldLabelClass}>Reason to go</p>
                {conference.reason_to_go ? (
                  <p className={`${fieldValueClass} whitespace-pre-line`}>{conference.reason_to_go}</p>
                ) : (
                  <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                )}
              </div>
            </div>
          </section>

          {/* Section: Registration & fees */}
          <section className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Registration & fees</h3>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <p className={fieldLabelClass}>
                  <ExternalLink className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" aria-hidden />
                  Fee link
                </p>
                {conference.fee_link ? (
                  <a
                    href={conference.fee_link.split(/\s+/)[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${fieldValueClass} text-primary hover:underline break-all block`}
                  >
                    {conference.fee_link}
                    <ExternalLink className="inline h-3 w-3 ml-1 shrink-0" aria-hidden />
                  </a>
                ) : (
                  <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                )}
              </div>

              <div className="space-y-1.5">
                <p className={fieldLabelClass}>Partnership</p>
                {conference.partnership ? (
                  <p className={`${fieldValueClass} whitespace-pre-line`}>{conference.partnership}</p>
                ) : (
                  <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                )}
              </div>

              <div className="space-y-1.5">
                <p className={fieldLabelClass}>Fee</p>
                {conference.fee ? (
                  <p className={`${fieldValueClass} whitespace-pre-line`}>{conference.fee}</p>
                ) : (
                  <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                )}
              </div>
            </div>
          </section>

          {/* Section: Ratings */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              <Star className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" aria-hidden />
              Ratings
            </h3>
            {conference.rating &&
            (conference.rating.accessibility_rating ||
              conference.rating.skill_improvement_rating ||
              conference.rating.finding_partners_rating) ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className={fieldLabelClass}>Accessibility</p>
                  {conference.rating.accessibility_rating ? (
                    <RatingDisplay value={conference.rating.accessibility_rating} />
                  ) : (
                    <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className={fieldLabelClass}>Skill improvement</p>
                  {conference.rating.skill_improvement_rating ? (
                    <RatingDisplay value={conference.rating.skill_improvement_rating} />
                  ) : (
                    <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className={fieldLabelClass}>Finding partners</p>
                  {conference.rating.finding_partners_rating ? (
                    <RatingDisplay value={conference.rating.finding_partners_rating} />
                  ) : (
                    <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
                  )}
                </div>
              </div>
            ) : (
              <p className={`${fieldValueClass} text-muted-foreground`}>—</p>
            )}
          </section>

          {/* Edit button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleEdit} className="gap-2 bg-[#FFA600] text-white hover:bg-[#FFA600]/90">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
