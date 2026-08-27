"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2, Plus, Redo2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSceneStore, useSceneTemporalStore } from "@/store/sceneStore";
import { useViewportStore } from "@/store/viewportStore";
import type { SceneNode, Viewport } from "@/types/scene";

// react-konva touches the canvas/DOM at module load; it can't run during SSR.
const CanvasStage = dynamic(
  () => import("@/components/canvas/CanvasStage").then((mod) => mod.CanvasStage),
  { ssr: false },
);

interface SceneResponse {
  nodes: Record<string, SceneNode>;
  rootIds: string[];
  viewport: Viewport;
  version: number;
}

type Status = "loading" | "error" | "ready";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [status, setStatus] = React.useState<Status>("loading");
  const [errorMessage, setErrorMessage] = React.useState("");

  const setScene = useSceneStore((state) => state.setScene);
  const setViewport = useViewportStore((state) => state.setViewport);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus("loading");

      try {
        const response = await fetch(`/api/projects/${id}/scene`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Couldn't load this project.");
        }

        if (cancelled) return;

        const scene: SceneResponse = data;
        setScene({ nodes: scene.nodes, rootIds: scene.rootIds });
        useSceneStore.temporal.getState().clear();
        setViewport(scene.viewport);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : "Couldn't load this project.");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, setScene, setViewport]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-destructive">{errorMessage}</p>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return <CanvasWorkspace />;
}

function CanvasWorkspace() {
  const rootIds = useSceneStore((state) => state.rootIds);
  const selectedIds = useSceneStore((state) => state.selectedIds);
  const addNode = useSceneStore((state) => state.addNode);

  const canUndo = useSceneTemporalStore((state) => state.pastStates.length > 0);
  const canRedo = useSceneTemporalStore((state) => state.futureStates.length > 0);
  const undo = useSceneTemporalStore((state) => state.undo);
  const redo = useSceneTemporalStore((state) => state.redo);

  return (
    <div className="flex h-screen flex-col">
      <header className="glass-panel z-40 flex items-center justify-between px-6 py-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <span className="mr-1 text-xs text-muted-foreground">
            {rootIds.length} node{rootIds.length === 1 ? "" : "s"} · {selectedIds.length} selected
          </span>
          <Button variant="ghost" size="icon" onClick={() => undo()} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => redo()} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" />
            <span className="sr-only">Redo</span>
          </Button>
          <Button
            size="sm"
            onClick={() =>
              addNode({
                type: "rect",
                // Cascade so repeated adds don't stack exactly on top of each other.
                x: 80 + rootIds.length * 24,
                y: 80 + rootIds.length * 24,
              })
            }
          >
            <Plus className="h-4 w-4" />
            Add rectangle
          </Button>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <CanvasStage />
      </main>
    </div>
  );
}
