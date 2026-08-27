"use client";

import * as React from "react";
import type Konva from "konva";
import { Shape } from "react-konva";

import { expandRect, getVisibleWorldRect, rectContains, type WorldRect } from "@/lib/konva-geometry";
import { useViewportStore } from "@/store/viewportStore";

const DOT_SPACING = 32;
const DOT_RADIUS = 1.3;
/** The cached area is drawn this much bigger than the current viewport (0.5 = +50% per side)
 * so small pans/zooms don't force a re-rasterize — see the containment check below. */
const BUFFER_FACTOR = 0.6;

interface GridBackgroundProps {
  width: number;
  height: number;
  dotColor: string;
}

/**
 * A dot grid that scales with zoom "for free": it's drawn once (covering a
 * buffer beyond the visible area) into an offscreen bitmap via Konva's
 * `.cache()`, and every pan/zoom frame after that is just the Stage
 * compositing that bitmap through its normal transform — no per-frame
 * redraw. We only re-rasterize when the visible viewport is about to reach
 * the edge of what's cached.
 */
export function GridBackground({ width, height, dotColor }: GridBackgroundProps) {
  const shapeRef = React.useRef<Konva.Shape>(null);
  const cachedRectRef = React.useRef<WorldRect | null>(null);

  const viewportX = useViewportStore((s) => s.x);
  const viewportY = useViewportStore((s) => s.y);
  const viewportScale = useViewportStore((s) => s.scale);

  const sceneFunc = React.useCallback(
    (ctx: Konva.Context) => {
      const rect = cachedRectRef.current;
      if (!rect) return;

      const startX = Math.floor(rect.x / DOT_SPACING) * DOT_SPACING;
      const startY = Math.floor(rect.y / DOT_SPACING) * DOT_SPACING;
      const endX = rect.x + rect.width;
      const endY = rect.y + rect.height;

      ctx.fillStyle = dotColor;
      for (let gx = startX; gx <= endX; gx += DOT_SPACING) {
        for (let gy = startY; gy <= endY; gy += DOT_SPACING) {
          ctx.beginPath();
          ctx.arc(gx, gy, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    },
    [dotColor],
  );

  React.useEffect(() => {
    const shape = shapeRef.current;
    if (!shape || width <= 0 || height <= 0) return;

    const visible = getVisibleWorldRect({ x: viewportX, y: viewportY, scale: viewportScale }, width, height);
    const cached = cachedRectRef.current;

    if (cached && rectContains(cached, visible)) {
      return;
    }

    const next = expandRect(visible, BUFFER_FACTOR);
    cachedRectRef.current = next;
    shape.cache({ x: next.x, y: next.y, width: next.width, height: next.height, pixelRatio: 1 });
    shape.getLayer()?.batchDraw();
  }, [viewportX, viewportY, viewportScale, width, height, dotColor]);

  return <Shape ref={shapeRef} sceneFunc={sceneFunc} listening={false} perfectDrawEnabled={false} />;
}
