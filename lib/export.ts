import * as XLSX from "xlsx";
import type { Conference, Person, Office } from "@/types";
import { formatCurrency, formatDateRange } from "./format";

/**
 * Export conferences to Excel file
 */
export function exportConferencesToExcel(
  conferences: Conference[],
  people: Person[],
  offices: Office[]
): void {
  // Create a map for quick person lookup
  const peopleMap = new Map(people.map((p) => [p.id, p]));

  // Prepare data with clean column labels
  const excelData = conferences.map((conference) => {
    const person = conference.assigned_to ? peopleMap.get(conference.assigned_to) : null;
    
    // Find office by matching location name
    const office = offices.find(
      (o) => o.name.toLowerCase() === conference.location.toLowerCase()
    );

    return {
      "Conference Name": conference.name,
      "Location": conference.location,
      "Office": office?.name || "",
      "Category": conference.category,
      "Price": conference.price,
      "Currency": conference.currency || "SEK",
      "Price Formatted": formatCurrency(conference.price, conference.currency || "SEK"),
      "Assigned To": person?.name || "",
      "Assigned Email": person?.email || "",
      "Start Date": conference.start_date || "",
      "End Date": conference.end_date || "",
      "Date Range": formatDateRange(conference.start_date, conference.end_date),
      "Status": conference.status || "",
      "Event Link": conference.event_link || "",
      "Notes": conference.notes || "",
      "Created At": conference.created_at ? new Date(conference.created_at).toLocaleDateString() : "",
      "Updated At": conference.updated_at ? new Date(conference.updated_at).toLocaleDateString() : "",
    };
  });

  // Create a new workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for better readability
  const colWidths = [
    { wch: 30 }, // Conference Name
    { wch: 25 }, // Location
    { wch: 20 }, // Office
    { wch: 20 }, // Category
    { wch: 12 }, // Price
    { wch: 10 }, // Currency
    { wch: 15 }, // Price Formatted
    { wch: 20 }, // Assigned To
    { wch: 25 }, // Assigned Email
    { wch: 12 }, // Start Date
    { wch: 12 }, // End Date
    { wch: 25 }, // Date Range
    { wch: 12 }, // Status
    { wch: 40 }, // Event Link
    { wch: 50 }, // Notes
    { wch: 12 }, // Created At
    { wch: 12 }, // Updated At
  ];
  ws["!cols"] = colWidths;

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(wb, ws, "Conferences");

  // Generate filename with current date
  const date = new Date().toISOString().split("T")[0];
  const filename = `conferences_export_${date}.xlsx`;

  // Write the file and trigger download
  XLSX.writeFile(wb, filename);
}
