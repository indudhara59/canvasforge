import type { NodeType, SceneNode } from "@/types/scene";

const TYPE_DEFAULTS: Record<NodeType, Partial<SceneNode>> = {
  rect: { width: 120, height: 80, fill: "#6366f1", stroke: null, strokeWidth: 0, cornerRadius: 0 },
  ellipse: { width: 120, height: 120, fill: "#6366f1", stroke: null, strokeWidth: 0 },
  text: {
    width: 160,
    height: 24,
    content: "Text",
    fontSize: 16,
    fontFamily: "var(--font-geist-sans)",
    fontWeight: 400,
    textAlign: "left",
    fill: "#e4e4e7",
  },
  image: { width: 200, height: 150, src: "" },
  frame: { width: 320, height: 240, fill: "#18181b", clipsContent: true },
  group: { width: 0, height: 0 },
};

export function createNode(
  input: Partial<SceneNode> & Pick<SceneNode, "type">,
): SceneNode {
  const defaults = TYPE_DEFAULTS[input.type];

  return {
    id: input.id ?? crypto.randomUUID(),
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    zIndex: 0,
    parentId: null,
    ...defaults,
    ...input,
  };
}
