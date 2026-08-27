export type NodeType = "rect" | "ellipse" | "text" | "image" | "frame" | "group";

/**
 * A single scene-graph node. Kept as one flat shape (rather than a
 * discriminated union) because the store's generic update/duplicate/reparent
 * actions operate on arbitrary `Partial<SceneNode>` patches across mixed
 * selections — a union would force type-narrowing at every call site for
 * little benefit here. Type-specific fields are optional and only
 * populated for the node types that use them.
 */
export interface SceneNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  parentId: string | null;
  name?: string;

  // rect / ellipse / frame
  fill?: string;
  stroke?: string | null;
  strokeWidth?: number;
  cornerRadius?: number;

  // frame
  clipsContent?: boolean;

  // text
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textAlign?: "left" | "center" | "right";

  // image
  src?: string;
}

export interface Viewport {
  x: number;
  y: number;
  scale: number;
}
