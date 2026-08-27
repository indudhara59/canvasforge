import type { SceneNode } from "@/types/scene";

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Axis-aligned bounding box enclosing every node's untransformed rect. */
export function getBoundsForNodes(nodes: SceneNode[]): Bounds | null {
  if (nodes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
