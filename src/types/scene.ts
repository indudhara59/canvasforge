/**
 * Placeholder shape for a single canvas node. The full scene-graph schema
 * will be fleshed out alongside the canvas renderer; for now this just
 * gives the Scene/SceneVersion `nodes` map something concrete to type against.
 */
export interface SceneNode {
  id: string;
  type: string;
  parentId: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  props?: Record<string, unknown>;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}
