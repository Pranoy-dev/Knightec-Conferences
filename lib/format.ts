import { format, parseISO } from "date-fns";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  try {
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch {
    return dateString;
  }
}

export function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return "";
  if (startDate && endDate) {
    try {
      const start = format(parseISO(startDate), "MMM d");
      const end = format(parseISO(endDate), "MMM d, yyyy");
      return `${start} - ${end}`;
    } catch {
      return `${startDate} - ${endDate}`;
    }
  }
  return formatDate(startDate || endDate);
}
