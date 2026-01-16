"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Person } from "@/types";
import { Trash2 } from "lucide-react";

interface PeopleListProps {
  people: Person[];
  onDelete?: (id: string) => void;
  conferences?: Array<{ assigned_to: string | null }>;
}

export function PeopleList({ people, onDelete, conferences = [] }: PeopleListProps) {
  if (people.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No people added yet</p>
      </div>
    );
  }

  const getAssignedCount = (personId: string) => {
    return conferences.filter((c) => c.assigned_to === personId).length;
  };

  return (
    <div className="space-y-2">
      {people.map((person) => {
        const assignedCount = getAssignedCount(person.id);
        return (
          <div
            key={person.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div>
              <p className="font-medium">{person.name}</p>
              <p className="text-sm text-muted-foreground">{person.email}</p>
              {assignedCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Assigned to {assignedCount} conference{assignedCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Person</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{person.name}"?
                      {assignedCount > 0 && (
                        <span className="block mt-2 text-destructive font-medium">
                          Warning: This person is assigned to {assignedCount} conference
                          {assignedCount !== 1 ? "s" : ""}. You cannot delete them until they are unassigned.
                        </span>
                      )}
                      {assignedCount === 0 && " This action cannot be undone."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(person.id)}
                      disabled={assignedCount > 0}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        );
      })}
    </div>
  );
}
