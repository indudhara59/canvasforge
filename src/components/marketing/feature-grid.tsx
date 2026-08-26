"use client";

import { motion } from "framer-motion";
import { Layers, Users, MousePointer2, Palette, Zap, GitBranch } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Infinite canvas",
    description:
      "Pan and zoom across an unbounded workspace. Organize entire product lines without ever hitting an edge.",
  },
  {
    icon: Users,
    title: "Real-time collaboration",
    description:
      "See every cursor, comment, and change the moment it happens. No refresh, no merge conflicts.",
  },
  {
    icon: MousePointer2,
    title: "Vector-precision tools",
    description:
      "Pen, boolean ops, and snapping that feel instant — built for pixel-perfect output at any scale.",
  },
  {
    icon: Palette,
    title: "Living design systems",
    description:
      "Tokens, components, and themes that stay in sync across every file, automatically.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    description:
      "A rendering engine tuned for large files — thousands of layers, zero lag.",
  },
  {
    icon: GitBranch,
    title: "Version history",
    description:
      "Every change tracked, every version restorable. Branch a design the way you'd branch code.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function FeatureGrid() {
  return (
    <section id="features" className="relative mx-auto max-w-6xl px-6 py-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything a design team needs, nothing it doesn&apos;t.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          PixelForge Studio strips away the friction between an idea and a finished
          interface.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            variants={item}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="glass-panel group rounded-xl p-6"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 ease-out group-hover:bg-primary/15">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-medium">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
