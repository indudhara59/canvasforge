import { FolderPlus, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-glass-border/15 px-6 py-24 text-center">
      <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FolderPlus className="h-7 w-7" />
        <Sparkles className="absolute -right-1.5 -top-1.5 h-5 w-5 text-primary/70" />
      </div>
      <h2 className="text-lg font-medium">No projects yet</h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Create your first canvas and start turning ideas into pixel-perfect
        designs.
      </p>
      <div className="mt-6">
        <NewProjectDialog
          trigger={
            <Button size="lg">
              <Plus className="h-4 w-4" />
              Create your first project
            </Button>
          }
        />
      </div>
    </div>
  );
}
