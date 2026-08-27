"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { EmptyState } from "@/components/dashboard/empty-state";
import { ProjectCard } from "@/components/dashboard/project-card";
import { ProjectGridSkeleton } from "@/components/dashboard/project-grid-skeleton";
import type { ProjectSummary } from "@/types/project";

type Status = "loading" | "error" | "ready";

export default function DashboardPage() {
  const [projects, setProjects] = React.useState<ProjectSummary[]>([]);
  const [status, setStatus] = React.useState<Status>("loading");

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error();
        const data: ProjectSummary[] = await response.json();
        if (!cancelled) {
          setProjects(data);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRenamed = (id: string, name: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleDeleted = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you&apos;re working on, in one place.
        </p>
      </div>

      {status === "loading" ? (
        <ProjectGridSkeleton />
      ) : status === "error" ? (
        <p className="text-sm text-destructive">
          Couldn&apos;t load your projects. Try refreshing the page.
        </p>
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onRenamed={handleRenamed}
                onDeleted={handleDeleted}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
