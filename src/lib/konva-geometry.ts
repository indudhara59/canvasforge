import type { SceneNode, Viewport } from "@/types/scene";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export interface WorldRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The world-space rectangle currently visible inside a container of the given pixel size. */
export function getVisibleWorldRect(
  viewport: Viewport,
  containerWidth: number,
  containerHeight: number,
): WorldRect {
  return {
    x: -viewport.x / viewport.scale,
    y: -viewport.y / viewport.scale,
    width: containerWidth / viewport.scale,
    height: containerHeight / viewport.scale,
  };
}

/** `rect` grown by `marginFactor` on every side (0.5 = 50% extra each side). */
export function expandRect(rect: WorldRect, marginFactor: number): WorldRect {
  const extraWidth = rect.width * marginFactor;
  const extraHeight = rect.height * marginFactor;
  return {
    x: rect.x - extraWidth / 2,
    y: rect.y - extraHeight / 2,
    width: rect.width + extraWidth,
    height: rect.height + extraHeight,
  };
}

export function rectContains(outer: WorldRect, inner: WorldRect) {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

export function rectsIntersect(a: WorldRect, b: WorldRect) {
  return (
    a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
  );
}

export function normalizeRect(a: { x: number; y: number }, b: { x: number; y: number }): WorldRect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

/**
 * Every node in this app is positioned/rotated/scaled around its CENTER on the
 * Konva side (via an offsetX/Y = width/2,height/2 trick for box shapes, and
 * natively for Ellipse) even though SceneNode stores top-left + width/height.
 * These two helpers convert between the two.
 */
export function nodeCenter(node: Pick<SceneNode, "x" | "y" | "width" | "height">) {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

export function topLeftFromCenter(
  center: { x: number; y: number },
  size: { width: number; height: number },
) {
  return { x: center.x - size.width / 2, y: center.y - size.height / 2 };
}
