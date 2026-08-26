"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/marketing/animated-background";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 pt-24">
      <AnimatedBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex max-w-3xl flex-col items-center text-center"
      >
        <motion.div
          variants={item}
          className="glass-panel mb-8 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Now in public beta
        </motion.div>

        <motion.h1
          variants={item}
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        >
          Design at the
          <br />
          <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-pan">
            speed of thought.
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-balance text-lg text-muted-foreground"
        >
          An infinite canvas for product teams — vector-precision tools, real-time
          collaboration, and a workspace that stays out of your way. Built for people
          who ship.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button asChild size="lg" className="group h-11 px-6 shadow-glow-accent">
              <Link href="/login">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button asChild variant="glass" size="lg" className="h-11 px-6">
              <Link href="#features">See how it works</Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.p variants={item} className="mt-6 text-xs text-muted-foreground">
          No credit card required · Free forever for individuals
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
        className="glass-panel-solid relative z-10 mt-16 w-full max-w-4xl overflow-hidden rounded-xl"
      >
        <div className="flex items-center gap-1.5 border-b border-glass-border/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <div className="bg-grid relative flex aspect-[16/9] items-center justify-center bg-secondary/30">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-10 w-10 rounded-lg border border-dashed border-glass-border/20" />
            <p className="text-sm">Your canvas, ready when you are.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
