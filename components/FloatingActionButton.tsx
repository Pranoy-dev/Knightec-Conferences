"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddConferenceForm } from "./AddConferenceForm";
import { AddPersonForm } from "./AddPersonForm";
import { AddCategoryForm } from "./AddCategoryForm";
import { Plus, X, Users, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

interface FloatingActionButtonProps {
  people: Person[];
  onPersonAdded?: () => void;
  onConferenceAdded?: () => void;
  onCategoryAdded?: () => void;
}

export function FloatingActionButton({
  people,
  onPersonAdded,
  onConferenceAdded,
  onCategoryAdded,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showConferenceForm, setShowConferenceForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const handlePersonClick = () => {
    setIsOpen(false);
    setShowPersonForm(true);
  };

  const handleConferenceClick = () => {
    setIsOpen(false);
    setShowConferenceForm(true);
  };

  const handleCategoryClick = () => {
    setIsOpen(false);
    setShowCategoryForm(true);
  };

  const handlePersonSuccess = () => {
    setShowPersonForm(false);
    onPersonAdded?.();
  };

  const handleConferenceSuccess = () => {
    setShowConferenceForm(false);
    onConferenceAdded?.();
  };

  const handleCategorySuccess = () => {
    setShowCategoryForm(false);
    onCategoryAdded?.();
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50">
        {/* Menu Items */}
        <div
          className={cn(
            "absolute bottom-16 right-0 mb-2 flex flex-col gap-2 transition-all duration-300",
            isOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
          <Button
            onClick={handlePersonClick}
            size="lg"
            className="h-14 px-6 shadow-xl rounded-full gap-3 animate-in slide-in-from-bottom-2 hover:shadow-2xl transition-shadow bg-black text-white hover:bg-black/90"
            style={{ animationDelay: isOpen ? "0.1s" : "0s" }}
          >
            <Users className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">Add Person</span>
          </Button>
          <Button
            onClick={handleConferenceClick}
            size="lg"
            className="h-14 px-6 shadow-xl rounded-full gap-3 animate-in slide-in-from-bottom-2 hover:shadow-2xl transition-shadow bg-black text-white hover:bg-black/90"
            style={{ animationDelay: isOpen ? "0.2s" : "0s" }}
          >
            <Calendar className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">Add Conference</span>
          </Button>
          <Button
            onClick={handleCategoryClick}
            size="lg"
            className="h-14 px-6 shadow-xl rounded-full gap-3 animate-in slide-in-from-bottom-2 hover:shadow-2xl transition-shadow bg-black text-white hover:bg-black/90"
            style={{ animationDelay: isOpen ? "0.3s" : "0s" }}
          >
            <Tag className="h-5 w-5 text-white" />
            <span className="font-semibold text-white">Add Category</span>
          </Button>
        </div>

        {/* Main FAB Button */}
        <Button
          onClick={handleToggle}
          size="lg"
          type="button"
          className={cn(
            "h-16 w-16 rounded-full shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-[#FFA600] text-white hover:bg-[#FFA600]/90 relative z-10",
            isOpen && "rotate-45"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Plus className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>

      {/* Person Form Dialog */}
      <Dialog open={showPersonForm} onOpenChange={setShowPersonForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
            <DialogDescription>
              Add a new person to assign conferences to.
            </DialogDescription>
          </DialogHeader>
          <AddPersonForm
            onSuccess={handlePersonSuccess}
            onCancel={() => setShowPersonForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Conference Form Dialog */}
      <Dialog
        open={showConferenceForm}
        onOpenChange={setShowConferenceForm}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Conference</DialogTitle>
            <DialogDescription>
              Add a new conference event to track.
            </DialogDescription>
          </DialogHeader>
          <AddConferenceForm
            people={people}
            onSuccess={handleConferenceSuccess}
            onCancel={() => setShowConferenceForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Add a new category for conferences.
            </DialogDescription>
          </DialogHeader>
          <AddCategoryForm
            onSuccess={handleCategorySuccess}
            onCancel={() => setShowCategoryForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
