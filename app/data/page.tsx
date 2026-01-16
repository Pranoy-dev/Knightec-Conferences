"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeopleList } from "@/components/PeopleList";
import { deletePerson, deleteConference, getAllPeople, getAllConferences } from "@/lib/db";
import type { Person, Conference } from "@/types";
import { toast } from "sonner";
import { ArrowLeft, Users, Calendar } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateRange } from "@/lib/format";
import { Trash2 } from "lucide-react";

export default function DataPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [peopleData, conferencesData] = await Promise.all([
        getAllPeople(),
        getAllConferences(),
      ]);
      setPeople(peopleData);
      setConferences(conferencesData);
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

  const handleDeletePerson = async (id: string) => {
    try {
      const assignedConferences = conferences.filter((c) => c.assigned_to === id);
      if (assignedConferences.length > 0) {
        toast.error(
          `Cannot delete person. They are assigned to ${assignedConferences.length} conference(s). Please reassign or delete those conferences first.`
        );
        return;
      }
      await deletePerson(id);
      toast.success("Person deleted successfully");
      loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete person";
      toast.error(errorMessage);
    }
  };

  const handleDeleteConference = async (id: string) => {
    try {
      await deleteConference(id);
      toast.success("Conference deleted successfully");
      loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete conference";
      toast.error(errorMessage);
    }
  };

  const getPersonName = (personId: string | null) => {
    if (!personId) return "Unassigned";
    const person = people.find((p) => p.id === personId);
    return person?.name || "Unknown";
  };

  const getAssignedCount = (personId: string) => {
    return conferences.filter((c) => c.assigned_to === personId).length;
  };

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
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="hover:bg-accent/50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Data Management</h1>
          <p className="text-muted-foreground text-base">
            Manage people and conferences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="people" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="people" className="gap-2">
            <Users className="h-4 w-4" />
            People ({people.length})
          </TabsTrigger>
          <TabsTrigger value="conferences" className="gap-2">
            <Calendar className="h-4 w-4" />
            Conferences ({conferences.length})
          </TabsTrigger>
        </TabsList>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-4 mt-6">
          {people.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No people added yet</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Conferences</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {people.map((person) => {
                    const assignedCount = getAssignedCount(person.id);
                    return (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell>{person.email}</TableCell>
                        <TableCell>
                          <Badge variant={assignedCount > 0 ? "default" : "secondary"}>
                            {assignedCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
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
                                  onClick={() => handleDeletePerson(person.id)}
                                  disabled={assignedCount > 0}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Conferences Tab */}
        <TabsContent value="conferences" className="space-y-4 mt-6">
          {conferences.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No conferences added yet</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conferences.map((conference) => (
                      <TableRow key={conference.id}>
                        <TableCell className="font-medium">{conference.name}</TableCell>
                        <TableCell>{conference.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{conference.category}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(conference.price)}</TableCell>
                        <TableCell>{getPersonName(conference.assigned_to)}</TableCell>
                        <TableCell>
                          {conference.status && (
                            <Badge variant="secondary">{conference.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateRange(conference.start_date, conference.end_date) || "-"}
                        </TableCell>
                        <TableCell className="text-right">
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
                                <AlertDialogTitle>Delete Conference</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{conference.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteConference(conference.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
