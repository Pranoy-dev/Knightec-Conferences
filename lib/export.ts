import type { ConferenceWithRating, Person, Office } from "@/types";
import { formatCurrency } from "./format";

/**
 * Export conferences to Excel file
 */
export async function exportConferencesToExcel(
  conferences: ConferenceWithRating[],
  people: Person[],
  offices: Office[]
): Promise<void> {
  // Dynamically import xlsx to avoid SSR issues
  const XLSX = await import("xlsx");
  // Create a map for quick person lookup
  const peopleMap = new Map(people.map((p) => [p.id, p]));
  const officesMap = new Map(offices.map((o) => [o.id, o]));

  // Prepare data with clean column labels
  const excelData = conferences.map((conference) => {
    const person = conference.assigned_to ? peopleMap.get(conference.assigned_to) : null;
    
    // Find office by office_id
    const office = conference.office_id ? officesMap.get(conference.office_id) : null;

    return {
      "Conference Name": conference.name,
      "Location": conference.location,
      "Office": office?.name || "",
      "Category": conference.category,
      "Price": formatCurrency(conference.price, conference.currency || "SEK"),
      "Assigned To": person?.name || "",
      "Assigned Email": person?.email || "",
      "Start Date": conference.start_date || "",
      "End Date": conference.end_date || "",
      "Event Link": conference.event_link || "",
    };
  });

  // Create a new workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);

  // Make headers bold
  const headerRange = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true },
    };
  }

  // Set column widths for better readability
  const colWidths = [
    { wch: 30 }, // Conference Name
    { wch: 25 }, // Location
    { wch: 20 }, // Office
    { wch: 20 }, // Category
    { wch: 15 }, // Price
    { wch: 20 }, // Assigned To
    { wch: 25 }, // Assigned Email
    { wch: 12 }, // Start Date
    { wch: 12 }, // End Date
    { wch: 40 }, // Event Link
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
