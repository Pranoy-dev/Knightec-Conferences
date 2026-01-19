import { parse, isValid } from "date-fns";

/**
 * Scraped event data structure
 */
export interface ScrapedEventData {
  name?: string;
  location?: string;
  start_date?: string; // ISO date string (YYYY-MM-DD)
  end_date?: string; // ISO date string (YYYY-MM-DD)
  price?: number;
  description?: string;
  url?: string;
  category?: string; // Primary suggested category based on keywords
  suggestedCategories?: string[]; // Multiple category suggestions
}

/**
 * Parse Schema.org JSON-LD structured data from HTML
 * This is the most reliable method when available
 */
function parseSchemaOrgJsonLd(html: string): ScrapedEventData | null {
  try {
    // Find all script tags with type="application/ld+json"
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
    const matches = Array.from(html.matchAll(jsonLdRegex));

    for (const match of matches) {
      try {
        const jsonData = JSON.parse(match[1]);
        
        // Handle both single objects and arrays
        const schemas = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        for (const schema of schemas) {
          // Look for Event type
          if (schema["@type"] === "Event" || 
              schema["@type"] === "https://schema.org/Event" ||
              (Array.isArray(schema["@type"]) && schema["@type"].includes("Event"))) {
            
            const eventData: ScrapedEventData = {};
            
            // Extract name
            if (schema.name) {
              eventData.name = typeof schema.name === "string" ? schema.name : schema.name[0];
            }
            
            // Extract location - improved extraction
            if (schema.location) {
              if (typeof schema.location === "string") {
                eventData.location = schema.location;
              } else if (schema.location.name) {
                // Use location name, but also try to get address details
                const locationName = typeof schema.location.name === "string" 
                  ? schema.location.name 
                  : schema.location.name[0];
                
                if (schema.location.address) {
                  const addr = schema.location.address;
                  const parts = [locationName];
                  if (addr.streetAddress) parts.push(addr.streetAddress);
                  if (addr.addressLocality) parts.push(addr.addressLocality);
                  if (addr.addressRegion) parts.push(addr.addressRegion);
                  if (addr.postalCode) parts.push(addr.postalCode);
                  if (addr.addressCountry) parts.push(addr.addressCountry);
                  eventData.location = parts.filter(Boolean).join(", ");
                } else {
                  eventData.location = locationName;
                }
              } else if (schema.location.address) {
                const addr = schema.location.address;
                const parts = [];
                if (addr.streetAddress) parts.push(addr.streetAddress);
                if (addr.addressLocality) parts.push(addr.addressLocality);
                if (addr.addressRegion) parts.push(addr.addressRegion);
                if (addr.postalCode) parts.push(addr.postalCode);
                if (addr.addressCountry) parts.push(addr.addressCountry);
                eventData.location = parts.filter(Boolean).join(", ");
              }
            }
            
            // Extract start date
            if (schema.startDate) {
              const startDate = parseDate(schema.startDate);
              if (startDate) eventData.start_date = startDate;
            }
            
            // Extract end date
            if (schema.endDate) {
              const endDate = parseDate(schema.endDate);
              if (endDate) eventData.end_date = endDate;
            }
            
            // Extract price
            if (schema.offers) {
              const offers = Array.isArray(schema.offers) ? schema.offers : [schema.offers];
              for (const offer of offers) {
                if (offer.price) {
                  const price = parsePrice(offer.price);
                  if (price !== null) {
                    eventData.price = price;
                    break;
                  }
                }
              }
            }
            
            // Extract description
            if (schema.description) {
              eventData.description = typeof schema.description === "string" 
                ? schema.description 
                : schema.description[0];
            }
            
            // Extract URL
            if (schema.url) {
              eventData.url = typeof schema.url === "string" ? schema.url : schema.url[0];
            }
            
            return eventData;
          }
        }
      } catch (e) {
        // Skip invalid JSON, continue to next script tag
        continue;
      }
    }
  } catch (e) {
    // If parsing fails, return null
    return null;
  }
  
  return null;
}

/**
 * Parse date string to ISO format (YYYY-MM-DD)
 * Handles various date formats
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  try {
    // Try ISO format first (most common in JSON-LD)
    const isoDate = new Date(dateStr);
    if (isValid(isoDate)) {
      return isoDate.toISOString().split("T")[0];
    }
    
    // Try common date formats
    const formats = [
      "yyyy-MM-dd",
      "yyyy-MM-dd'T'HH:mm:ss",
      "yyyy-MM-dd'T'HH:mm:ss'Z'",
      "MM/dd/yyyy",
      "dd/MM/yyyy",
      "dd-MM-yyyy",
    ];
    
    for (const format of formats) {
      try {
        const parsed = parse(dateStr, format, new Date());
        if (isValid(parsed)) {
          return parsed.toISOString().split("T")[0];
        }
      } catch (e) {
        continue;
      }
    }
    
    // Last resort: try Date constructor
    const fallback = new Date(dateStr);
    if (isValid(fallback)) {
      return fallback.toISOString().split("T")[0];
    }
  } catch (e) {
    // Parsing failed
  }
  
  return null;
}

/**
 * Parse price from various formats
 * Returns price in the smallest currency unit (e.g., cents for USD, öre for SEK)
 * For simplicity, we'll return the numeric value and assume it's in the base unit
 */
function parsePrice(priceStr: string | number): number | null {
  if (typeof priceStr === "number") {
    return priceStr;
  }
  
  if (!priceStr) return null;
  
  // Remove currency symbols and extract number
  // Handles: $100, €50, 100 SEK, 100kr, etc.
  const priceMatch = priceStr.toString().match(/[\d,]+\.?\d*/);
  if (priceMatch) {
    const cleaned = priceMatch[0].replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  
  return null;
}

/**
 * Extract text content from HTML element
 */
function extractText(html: string, selector: string): string | null {
  // Simple regex-based extraction (for basic cases)
  // For production, consider using a proper HTML parser like cheerio
  const regex = new RegExp(`<[^>]*class=["'][^"']*${selector}[^"']*["'][^>]*>(.*?)</[^>]+>`, "gis");
  const match = html.match(regex);
  if (match) {
    return match[1].replace(/<[^>]+>/g, "").trim();
  }
  return null;
}

/**
 * Check if a string looks like a URL
 */
function isUrl(str: string): boolean {
  return /^https?:\/\//i.test(str) || 
         str.includes("www.") || 
         str.includes(".com") || 
         str.includes(".se") ||
         str.includes(".org") ||
         str.match(/^[a-z]+:\/\//i) !== null;
}

/**
 * Extract location from HTML with improved patterns
 */
function extractLocationFromHtml(html: string): string | null {
  // Try meta tags first
  const metaLocationPatterns = [
    /<meta[^>]*property=["']og:locality["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*name=["']location["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*name=["']geo.placename["'][^>]*content=["']([^"']+)["']/i,
  ];
  
  for (const pattern of metaLocationPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim();
      if (!isUrl(location) && location.length > 3 && location.length < 200) {
        return location;
      }
    }
  }
  
  // Look for location in structured data attributes
  const dataLocationPatterns = [
    /<[^>]*data-location=["']([^"']+)["'][^>]*>/i,
    /<[^>]*data-venue=["']([^"']+)["'][^>]*>/i,
    /<[^>]*itemprop=["']location["'][^>]*>.*?<[^>]*itemprop=["']name["'][^>]*>([^<]+)</i,
  ];
  
  for (const pattern of dataLocationPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const location = match[1].replace(/<[^>]+>/g, "").trim();
      if (location.length > 3 && location.length < 200 && !isUrl(location)) {
        return location;
      }
    }
  }
  
  // Extract text content between HTML tags (visible text only)
  // Look for "Where?" pattern followed by location in text content
  // This approach extracts text between > and < to avoid HTML attributes
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove scripts
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove styles
    .replace(/<[^>]+>/g, " ") // Replace tags with spaces
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  
  // Look for "Where?" pattern in clean text content
  const whereInText = textContent.match(/_Where\?_\s+([A-Z0-9][A-Za-z0-9\s,&-]{10,150})(?:\s+&|\s+Online|$)/i);
  if (whereInText && whereInText[1]) {
    const location = whereInText[1].trim();
    if (location.length > 5 && 
        location.length < 200 && 
        !isUrl(location) &&
        /[A-Z]/.test(location) &&
        !location.match(/^(date|time|when|price|cost|ticket|register|click|here)$/i)) {
      return location;
    }
  }
  
  // Also try pattern: "Where?" followed by location
  const wherePattern = textContent.match(/Where\?\s+([A-Z0-9][A-Za-z0-9\s,&-]{10,150})(?:\s+&|\s+Online|$)/i);
  if (wherePattern && wherePattern[1]) {
    const location = wherePattern[1].trim();
    if (location.length > 5 && 
        location.length < 200 && 
        !isUrl(location) &&
        /[A-Z]/.test(location) &&
        !location.match(/^(date|time|when|price|cost|ticket|register|click|here)$/i)) {
      return location;
    }
  }
  
  // Look for address pattern in text content: "7A Posthuset, Stockholm, Sweden"
  const addressInText = textContent.match(/(\d+[A-Z]?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+),\s*([A-Z][a-z]+(?:\s+&?\s*Online)?)/i);
  if (addressInText && addressInText[1] && addressInText[2] && addressInText[3]) {
    const location = `${addressInText[1]}, ${addressInText[2]}, ${addressInText[3]}`.trim();
    if (location.length > 10 && 
        location.length < 200 && 
        !isUrl(location)) {
      return location;
    }
  }
  
  // Look for location patterns in visible text content (not in HTML attributes)
  // Extract text between tags that looks like a location
  const textContentPatterns = [
    // Pattern: Address-like structures in text content
    /(?:>|^)(\d+[A-Z]?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+),\s*([A-Z][a-z]+(?:\s+&?\s*Online)?)(?:<|$)/g,
    // Pattern: City, Country format
    /(?:>|^)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)(?:<|$)/g,
  ];
  
  for (const pattern of textContentPatterns) {
    const matches = Array.from(html.matchAll(pattern));
    for (const match of matches) {
      if (match[0]) {
        // Extract the full match but clean it
        let location = match[0]
          .replace(/^>|<$/g, "")
          .replace(/<[^>]+>/g, "")
          .trim();
        
        // Combine groups if we have them
        if (match[1] && match[2] && match[3]) {
          location = `${match[1]}, ${match[2]}, ${match[3]}`;
        } else if (match[1] && match[2]) {
          location = `${match[1]}, ${match[2]}`;
        }
        
        // Filter out HTML attributes and class names
        if (location.includes("class=") || 
            location.includes("header-") || 
            location.includes("style-") ||
            location.match(/^[a-z-]+$/)) {
          continue;
        }
        
        if (location.length > 5 && 
            location.length < 200 && 
            !isUrl(location) &&
            /[A-Z]/.test(location)) {
          return location;
        }
      }
    }
  }
  
  // Last resort: Look for common location keywords followed by text
  // Use word boundaries to avoid matching substrings in HTML class names
  const keywordPatterns = [
    // Pattern: "Where?" or "Location:" followed by text content (not in HTML attributes)
    /(?:^|>)\s*(?:Where\?|Location|Venue|Place|Address)[\s:]*([A-Z0-9][A-Za-z0-9\s,&-]{10,150})(?:<|$)/gi,
  ];
  
  for (const pattern of keywordPatterns) {
    const matches = Array.from(html.matchAll(pattern));
    for (const match of matches) {
      if (match[1]) {
        let location = match[1]
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .trim();
        
        // Strict filtering: exclude HTML class names, CSS classes, and attributes
        if (location.includes("class=") || 
            location.includes("header-") || 
            location.includes("style-") ||
            location.includes("container") ||
            location.includes("cover-") ||
            location.match(/^[a-z-]+$/) || // Only lowercase with dashes (CSS class)
            location.match(/^[a-z-]+\s+[a-z-]+$/)) { // Multiple CSS classes
          continue;
        }
        
        // Must look like a real location: contains capital letters and possibly numbers/commas
        if (location.length > 5 && 
            location.length < 200 && 
            !isUrl(location) &&
            /[A-Z]/.test(location) &&
            !/^[a-z-]+\s*$/.test(location)) { // Not just CSS classes
          return location;
        }
      }
    }
  }
  
  return null;
}

/**
 * Detect categories based on keywords in event name, description, and URL
 * Returns primary category and list of suggested categories
 */
function detectCategories(eventData: ScrapedEventData): { primary: string | null; suggestions: string[] } {
  // Combine all text sources for keyword matching
  const searchText = [
    eventData.name || "",
    eventData.description || "",
    eventData.url || "",
  ].join(" ").toLowerCase();
  
  // Category keyword mappings (case-insensitive)
  const categoryKeywords: Record<string, string[]> = {
    "Technology": [
      "tech", "technology", "software", "programming", "coding", "developer", "dev",
      "javascript", "python", "react", "node", "web", "mobile", "app", "api",
      "ai", "artificial intelligence", "machine learning", "ml", "data science",
      "cybersecurity", "cloud", "devops", "blockchain", "crypto", "iot",
      "frontend", "backend", "fullstack", "full-stack", "agile", "scrum"
    ],
    "Design": [
      "design", "ui", "ux", "user experience", "user interface", "graphic design",
      "visual design", "product design", "interaction design", "web design",
      "branding", "typography", "illustration", "animation", "figma", "sketch",
      "adobe", "photoshop", "illustrator", "service design", "content design"
    ],
    "Business": [
      "business", "entrepreneurship", "startup", "leadership", "management",
      "strategy", "marketing", "sales", "finance", "investment", "venture capital",
      "consulting", "networking", "innovation", "growth", "scale"
    ],
    "Data & Analytics": [
      "data", "analytics", "big data", "business intelligence", "bi", "sql",
      "database", "data engineering", "data analysis", "statistics", "metrics",
      "dashboard", "reporting", "etl"
    ],
    "Product Management": [
      "product", "product management", "pm", "product owner", "roadmap",
      "feature", "requirements", "user story", "backlog", "sprint"
    ],
    "Marketing": [
      "marketing", "digital marketing", "seo", "sem", "social media", "content",
      "brand", "advertising", "campaign", "email marketing", "ppc", "cmo", "cro"
    ],
    "Sales": [
      "sales", "b2b", "b2c", "account management", "customer success", "crm",
      "revenue", "pipeline", "deal", "closing"
    ],
    "HR & People": [
      "hr", "human resources", "recruiting", "talent", "people", "culture",
      "diversity", "inclusion", "team building", "employee"
    ],
    "Finance": [
      "finance", "accounting", "cfo", "financial planning", "budget", "forecast",
      "tax", "audit", "compliance"
    ],
    "Healthcare": [
      "healthcare", "health", "medical", "pharma", "biotech", "clinical",
      "patient", "hospital", "nursing"
    ],
    "Education": [
      "education", "learning", "training", "workshop", "course", "university",
      "school", "student", "teacher", "academic"
    ],
    "Conference": [
      "conference", "summit", "convention", "expo", "exhibition", "trade show",
      "meetup", "gathering", "forum"
    ],
    "Workshop": [
      "workshop", "training", "bootcamp", "course", "class", "seminar",
      "tutorial", "hands-on"
    ],
  };
  
  // Count matches for each category
  const categoryScores: Record<string, number> = {};
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      // Count occurrences of keyword in search text
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = searchText.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > 0) {
      categoryScores[category] = score;
    }
  }
  
  // Sort categories by score
  const sortedCategories = Object.entries(categoryScores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score > 0);
  
  if (sortedCategories.length === 0) {
    return { primary: null, suggestions: [] };
  }
  
  // Primary category is the one with highest score
  const primary = sortedCategories[0][0];
  
  // Get top 3-5 suggestions (categories with score > 0)
  const suggestions = sortedCategories
    .slice(0, 5)
    .map(([category]) => category);
  
  return { primary, suggestions };
}

/**
 * HTML scraping fallback - rule-based parsing
 * Looks for common patterns in HTML
 */
function parseHtmlFallback(html: string, url: string): ScrapedEventData {
  const eventData: ScrapedEventData = { url };
  
  // Extract title from <title> tag
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  if (titleMatch) {
    eventData.name = titleMatch[1].replace(/<[^>]+>/g, "").trim();
  }
  
  // Look for common date patterns
  const datePatterns = [
    /(?:date|when|event date)[\s:]*([\d]{1,2}[\/\-\.][\d]{1,2}[\/\-\.][\d]{4})/gi,
    /([\d]{4}[\/\-\.][\d]{1,2}[\/\-\.][\d]{1,2})/g,
  ];
  
  for (const pattern of datePatterns) {
    const matches = Array.from(html.matchAll(pattern));
    if (matches.length > 0) {
      const firstDate = parseDate(matches[0][1]);
      if (firstDate) {
        eventData.start_date = firstDate;
        break;
      }
    }
  }
  
  // Extract location using improved function
  const extractedLocation = extractLocationFromHtml(html);
  if (extractedLocation) {
    eventData.location = extractedLocation;
  }
  
  // Look for price patterns
  const pricePatterns = [
    /(?:price|cost|ticket|fee)[\s:]*([€$£]?\s*[\d,]+\.?\d*)/gi,
    /([€$£]?\s*[\d,]+\.?\d*)\s*(?:sek|kr|eur|usd|gbp)/gi,
  ];
  
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match) {
      const price = parsePrice(match[1]);
      if (price !== null) {
        eventData.price = price;
        break;
      }
    }
  }
  
  return eventData;
}

/**
 * Main function to scrape event data from a URL
 * Uses Schema.org JSON-LD first, falls back to HTML scraping
 */
export async function scrapeEventData(url: string): Promise<ScrapedEventData> {
  try {
    // Fetch the HTML
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Try Schema.org JSON-LD first (most reliable)
    const schemaData = parseSchemaOrgJsonLd(html);
    if (schemaData && schemaData.name) {
      // Ensure URL is set
      if (!schemaData.url) {
        schemaData.url = url;
      }
      // If location is missing or looks like a URL, try HTML extraction
      if (!schemaData.location || 
          schemaData.location.includes("http") || 
          schemaData.location.includes("www.") ||
          schemaData.location.match(/^https?:\/\//i)) {
        const htmlLocation = extractLocationFromHtml(html);
        if (htmlLocation) {
          schemaData.location = htmlLocation;
        } else if (schemaData.location && 
                   (schemaData.location.includes("http") || 
                    schemaData.location.includes("www.") ||
                    schemaData.location.match(/^https?:\/\//i))) {
          // If location is a URL, clear it
          schemaData.location = undefined;
        }
      }
      // Detect categories
      const categories = detectCategories(schemaData);
      schemaData.category = categories.primary || undefined;
      schemaData.suggestedCategories = categories.suggestions;
      return schemaData;
    }
    
    // Fallback to HTML scraping
    const htmlData = parseHtmlFallback(html, url);
    // Detect categories
    const categories = detectCategories(htmlData);
    htmlData.category = categories.primary || undefined;
    htmlData.suggestedCategories = categories.suggestions;
    return htmlData;
    
  } catch (error) {
    throw new Error(`Failed to scrape event data: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
