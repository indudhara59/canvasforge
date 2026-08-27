"use client";

import * as React from "react";
import Konva from "konva";
import { useTheme } from "next-themes";
import { Layer, Rect, Stage } from "react-konva";

import { clamp, normalizeRect, rectsIntersect, type WorldRect } from "@/lib/konva-geometry";
import { useSceneStore } from "@/store/sceneStore";
import { useViewportStore } from "@/store/viewportStore";

import { GridBackground } from "./GridBackground";
import { SceneNodeRenderer } from "./NodeRenderer";
import { SelectionOverlay } from "./SelectionOverlay";

const MIN_SCALE = 0.05;
const MAX_SCALE = 8;
const ZOOM_INTENSITY = 0.0015;
/** Screen-pixel distance a pointer must travel before a click becomes a marquee drag. */
const DRAG_THRESHOLD = 4;

export function CanvasStage() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<Konva.Stage>(null);
  const marqueeShapeRef = React.useRef<Konva.Rect>(null);
  const marqueeAnimationRef = React.useRef<Konva.Animation | null>(null);

  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const [marqueeRect, setMarqueeRect] = React.useState<WorldRect | null>(null);

  const pointerDownScreenRef = React.useRef<{ x: number; y: number } | null>(null);
  const marqueeStartWorldRef = React.useRef<{ x: number; y: number } | null>(null);
  const isMarqueeActiveRef = React.useRef(false);

  const rootIds = useSceneStore((s) => s.rootIds);
  // Select primitives individually — a selector that returns a fresh object
  // literal every call breaks zustand's snapshot-caching and infinite-loops.
  const viewportX = useViewportStore((s) => s.x);
  const viewportY = useViewportStore((s) => s.y);
  const viewportScale = useViewportStore((s) => s.scale);
  const viewport = { x: viewportX, y: viewportY, scale: viewportScale };
  const setViewport = useViewportStore((s) => s.setViewport);

  const { resolvedTheme } = useTheme();
  const dotColor = resolvedTheme === "light" ? "rgba(9, 9, 11, 0.16)" : "rgba(255, 255, 255, 0.12)";

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Marching-ants dash animation, only while a marquee is actually being drawn.
  // Deliberately keyed on presence, not the rect's contents — restarting the
  // animation loop on every mousemove would be wasteful.
  const hasMarquee = marqueeRect !== null;
  React.useEffect(() => {
    if (!hasMarquee) {
      marqueeAnimationRef.current?.stop();
      marqueeAnimationRef.current = null;
      return;
    }

    const shape = marqueeShapeRef.current;
    if (!shape) return;

    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      shape.dashOffset(-((frame.time / 35) % 8));
    }, shape.getLayer());

    anim.start();
    marqueeAnimationRef.current = anim;

    return () => {
      anim.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMarquee]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const current = useViewportStore.getState();

    if (e.evt.ctrlKey || e.evt.metaKey) {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const pointTo = {
        x: (pointer.x - current.x) / current.scale,
        y: (pointer.y - current.y) / current.scale,
      };
      const nextScale = clamp(
        current.scale * Math.exp(-e.evt.deltaY * ZOOM_INTENSITY),
        MIN_SCALE,
        MAX_SCALE,
      );

      setViewport({
        scale: nextScale,
        x: pointer.x - pointTo.x * nextScale,
        y: pointer.y - pointTo.y * nextScale,
      });
    } else {
      setViewport({ x: current.x - e.evt.deltaX, y: current.y - e.evt.deltaY });
    }
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage || e.target !== stage) return;

    const screenPos = stage.getPointerPosition();
    const worldPos = stage.getRelativePointerPosition();
    if (!screenPos || !worldPos) return;

    pointerDownScreenRef.current = screenPos;
    marqueeStartWorldRef.current = worldPos;
    isMarqueeActiveRef.current = false;
  };

  const handleMouseMove = () => {
    const stage = stageRef.current;
    const startScreen = pointerDownScreenRef.current;
    const startWorld = marqueeStartWorldRef.current;
    if (!stage || !startScreen || !startWorld) return;

    const screenPos = stage.getPointerPosition();
    if (!screenPos) return;

    if (!isMarqueeActiveRef.current) {
      const dx = screenPos.x - startScreen.x;
      const dy = screenPos.y - startScreen.y;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      isMarqueeActiveRef.current = true;
    }

    const worldPos = stage.getRelativePointerPosition();
    if (!worldPos) return;

    setMarqueeRect(normalizeRect(startWorld, worldPos));
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    const scene = useSceneStore.getState();

    if (isMarqueeActiveRef.current && marqueeRect) {
      // Marquee only considers root-level nodes — hit-testing into nested
      // frame/group children would need each node's absolute (parent-summed)
      // position, which this foundational renderer doesn't compute yet.
      const matched = scene.rootIds.filter((id) => {
        const node = scene.nodes[id];
        return (
          node &&
          rectsIntersect(marqueeRect, {
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
          })
        );
      });

      if (e.evt.shiftKey) {
        scene.setSelection(Array.from(new Set([...scene.selectedIds, ...matched])));
      } else {
        scene.setSelection(matched);
      }
    } else if (stage && e.target === stage && pointerDownScreenRef.current) {
      scene.clearSelection();
    }

    pointerDownScreenRef.current = null;
    marqueeStartWorldRef.current = null;
    isMarqueeActiveRef.current = false;
    setMarqueeRect(null);
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-background">
      {size.width > 0 && size.height > 0 && (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          x={viewport.x}
          y={viewport.y}
          scaleX={viewport.scale}
          scaleY={viewport.scale}
          draggable={false}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer listening={false}>
            <GridBackground width={size.width} height={size.height} dotColor={dotColor} />
          </Layer>

          <Layer>
            {rootIds.map((id) => (
              <SceneNodeRenderer key={id} id={id} />
            ))}
          </Layer>

          <Layer>
            <SelectionOverlay stageRef={stageRef} />
            {marqueeRect && (
              <Rect
                ref={marqueeShapeRef}
                x={marqueeRect.x}
                y={marqueeRect.y}
                width={marqueeRect.width}
                height={marqueeRect.height}
                fill="rgba(99, 102, 241, 0.12)"
                stroke="#6366f1"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
