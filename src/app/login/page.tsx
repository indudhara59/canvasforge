"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AnimatedBackground } from "@/components/marketing/animated-background";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="glass-panel-solid relative z-10 w-full max-w-sm rounded-2xl p-8"
      >
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">PixelForge Studio</span>
        </Link>

        <h1 className="text-center text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-center text-sm text-muted-foreground">
          Sign in to continue to your canvas.
        </p>

        <form className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </motion.div>
        </form>

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button variant="outline" className="w-full">
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
