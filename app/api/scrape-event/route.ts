import { NextRequest, NextResponse } from "next/server";
import { scrapeEventData } from "@/lib/scrape-event";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }
    
    // Scrape the event data
    const eventData = await scrapeEventData(url);
    
    return NextResponse.json({ data: eventData });
    
  } catch (error) {
    console.error("Error scraping event:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to scrape event data" 
      },
      { status: 500 }
    );
  }
}
