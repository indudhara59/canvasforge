import Link from "next/link";
import { Layers } from "lucide-react";

import { UserMenu } from "@/components/user-menu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="glass-panel sticky top-0 z-40 flex items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">PixelForge Studio</span>
        </Link>

        <UserMenu />
      </header>

      <main className="px-6 py-10">{children}</main>
    </div>
  );
}
