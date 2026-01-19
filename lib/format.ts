import { format, parseISO } from "date-fns";

export function formatCurrency(amount: number, currency: string = "SEK"): string {
  // Map currency codes to locale for proper formatting
  const localeMap: Record<string, string> = {
    SEK: "sv-SE",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    NOK: "nb-NO",
    DKK: "da-DK",
  };
  
  const locale = localeMap[currency] || "en-US";
  const currencyCode = currency || "SEK";
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
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
