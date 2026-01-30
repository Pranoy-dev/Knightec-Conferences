"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ConferenceWithRating, Person, Office } from "@/types";
import { formatDate } from "@/lib/format";
import { MapPin, Tag, User, ExternalLink, Star, Calendar } from "lucide-react";
import { RatingDisplay } from "@/components/ui/rating-display";

interface ConferenceCardProps {
  conference: ConferenceWithRating;
  person?: Person | null;
  office?: Office | null;
  onClick?: () => void;
}

export function ConferenceCard({ conference, person, office, onClick }: ConferenceCardProps) {
  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 border hover:border-primary/50 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
            {conference.name}
          </h3>
        </div>
        {office && (
          <Badge variant="default" className="w-fit bg-[#FFA600] text-white hover:bg-[#FFA600]/90">
            {office.name}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2.5">
          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Location</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(conference.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-primary hover:underline inline-block"
              >
                {conference.location}
              </a>
            </div>
          </div>

          {/* Start date */}
          {conference.start_date && (
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Start date</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {formatDate(conference.start_date)}
                </p>
              </div>
            </div>
          )}

          {/* Category - show up to "digital" length (~35 chars) then ... */}
          {conference.category && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Category</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="mt-1 cursor-help"
                    >
                      {conference.category.length > 33
                        ? `${conference.category.slice(0, 33)}...`
                        : conference.category}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-sm">
                    {conference.category}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {/* Assigned To */}
          {person && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p className="text-sm font-medium text-foreground mt-1">{person.name}</p>
              </div>
            </div>
          )}

          {/* Event Link */}
          {conference.event_link && (
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Event Link</p>
                <a
                  href={conference.event_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-medium text-primary hover:underline inline-block truncate max-w-full"
                  title={conference.event_link}
                >
                  {conference.event_link.length > 40 
                    ? `${conference.event_link.substring(0, 40)}...` 
                    : conference.event_link}
                </a>
              </div>
            </div>
          )}

          {/* Ratings */}
          {conference.rating && (
            conference.rating.accessibility_rating || 
            conference.rating.skill_improvement_rating || 
            conference.rating.finding_partners_rating
          ) && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ratings</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {conference.rating.accessibility_rating && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Accessibility</p>
                    <RatingDisplay value={conference.rating.accessibility_rating} size="sm" />
                  </div>
                )}
                {conference.rating.skill_improvement_rating && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Skill</p>
                    <RatingDisplay value={conference.rating.skill_improvement_rating} size="sm" />
                  </div>
                )}
                {conference.rating.finding_partners_rating && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Partners</p>
                    <RatingDisplay value={conference.rating.finding_partners_rating} size="sm" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
