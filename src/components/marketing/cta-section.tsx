"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section id="pricing" className="relative mx-auto max-w-6xl px-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel-solid relative overflow-hidden rounded-2xl px-8 py-16 text-center sm:px-16"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 0%, hsl(var(--primary) / 0.25), transparent 70%)",
          }}
        />
        <div className="relative">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Start designing in the next 30 seconds.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-balance text-muted-foreground">
            Free for individuals. No credit card, no setup — just an empty canvas
            and your next idea.
          </p>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 inline-block"
          >
            <Button asChild size="lg" className="group h-11 px-8 shadow-glow-accent">
              <Link href="/login">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
