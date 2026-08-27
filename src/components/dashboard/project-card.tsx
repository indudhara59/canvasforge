"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/relative-time";
import type { ProjectSummary } from "@/types/project";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const GRADIENTS = [
  "from-indigo-500/40 via-violet-500/30 to-fuchsia-500/20",
  "from-cyan-500/40 via-blue-500/30 to-indigo-500/20",
  "from-amber-500/40 via-orange-500/30 to-rose-500/20",
  "from-emerald-500/40 via-teal-500/30 to-cyan-500/20",
  "from-rose-500/40 via-pink-500/30 to-purple-500/20",
];

function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

interface ProjectCardProps {
  project: ProjectSummary;
  index: number;
  onRenamed: (id: string, name: string) => void;
  onDeleted: (id: string) => void;
}

export function ProjectCard({ project, index, onRenamed, onDeleted }: ProjectCardProps) {
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [draftName, setDraftName] = React.useState(project.name);
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const commitRename = async () => {
    setIsRenaming(false);
    const trimmed = draftName.trim();

    if (!trimmed || trimmed === project.name) {
      setDraftName(project.name);
      return;
    }

    const previous = project.name;
    onRenamed(project.id, trimmed);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!response.ok) throw new Error();
    } catch {
      onRenamed(project.id, previous);
      setDraftName(previous);
      toast.error("Couldn't rename project.");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setIsConfirmingDelete(false);
      onDeleted(project.id);
      toast.success("Project deleted.");
    } catch {
      toast.error("Couldn't delete this project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15, ease: "easeOut" } }}
      transition={{ duration: 0.35, ease: "easeOut", delay: index * 0.03 }}
      whileHover={{ y: -4 }}
      className="group glass-panel relative overflow-hidden rounded-xl transition-shadow duration-200 ease-out hover:shadow-glass"
    >
      <Link href={`/project/${project.id}`} className="block">
        <div
          className={cn(
            "aspect-video w-full bg-gradient-to-br",
            !project.thumbnailUrl && gradientFor(project.id),
          )}
        >
          {project.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.thumbnailUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="space-y-1 p-4">
          {isRenaming ? (
            <Input
              ref={inputRef}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitRename();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setDraftName(project.name);
                  setIsRenaming(false);
                }
              }}
              className="h-7 px-2 text-sm"
            />
          ) : (
            <p className="truncate text-sm font-medium">{project.name}</p>
          )}
          <p className="text-xs text-muted-foreground">{formatRelativeTime(project.updatedAt)}</p>
        </div>
      </Link>

      <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="glass" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Project options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                setDraftName(project.name);
                setIsRenaming(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onSelect={() => setIsConfirmingDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{project.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              This permanently deletes the project and its canvas. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
