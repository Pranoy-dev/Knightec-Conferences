"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { KnightecLogo } from "./KnightecLogo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-white/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/50 backdrop-saturate-150 shadow-lg shadow-black/5">
      <div className="container mx-auto px-6 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <KnightecLogo className="h-10 transition-transform group-hover:scale-105" />
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-3">
            <Link href="/data">
              <Button variant="outline" className="gap-2 shadow-sm hover:shadow-md transition-shadow bg-white/80 border-border/40 hover:bg-white/90">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Data</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
