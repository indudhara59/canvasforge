import Link from "next/link";
import { Layers } from "lucide-react";

import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-12">
      <Separator className="mb-8" />
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Layers className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-medium">PixelForge Studio</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} PixelForge Studio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
