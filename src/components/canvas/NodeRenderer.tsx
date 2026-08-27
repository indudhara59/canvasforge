"use client";

import * as React from "react";
import type Konva from "konva";
import { Ellipse, Group, Image as KonvaImage, Rect, Text } from "react-konva";
import useImage from "use-image";
import { useShallow } from "zustand/react/shallow";

import { nodeCenter, topLeftFromCenter } from "@/lib/konva-geometry";
import { getOrderedChildIds, useSceneStore } from "@/store/sceneStore";
import type { SceneNode } from "@/types/scene";

interface SceneNodeRendererProps {
  id: string;
}

interface SharedShapeProps {
  id: string;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  opacity: number;
  draggable: boolean;
  onClick: (e: Konva.KonvaEventObject<Event>) => void;
  onTap: (e: Konva.KonvaEventObject<Event>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

function commitTransform(id: string, target: Konva.Node) {
  const node = useSceneStore.getState().nodes[id];
  if (!node) return;

  const scaleX = target.scaleX();
  const scaleY = target.scaleY();
  const rotation = target.rotation();

  const newWidth = Math.max(4, node.width * scaleX);
  const newHeight = Math.max(4, node.height * scaleY);

  target.scaleX(1);
  target.scaleY(1);

  const topLeft = topLeftFromCenter({ x: target.x(), y: target.y() }, { width: newWidth, height: newHeight });

  const patch: Partial<SceneNode> = {
    ...topLeft,
    width: newWidth,
    height: newHeight,
    rotation,
  };

  // Resizing text scales the font instead of stretching the glyphs.
  if (node.type === "text") {
    const uniformScale = (scaleX + scaleY) / 2;
    patch.fontSize = Math.max(4, (node.fontSize ?? 16) * uniformScale);
  }

  useSceneStore.getState().updateNode(id, patch);
}

export const SceneNodeRenderer = React.memo(function SceneNodeRenderer({ id }: SceneNodeRendererProps) {
  const node = useSceneStore((s) => s.nodes[id]);
  const isSelected = useSceneStore((s) => s.selectedIds.includes(id));
  const updateNode = useSceneStore((s) => s.updateNode);
  const setSelection = useSceneStore((s) => s.setSelection);
  const toggleSelection = useSceneStore((s) => s.toggleSelection);

  const childIds = useSceneStore(useShallow((s) => getOrderedChildIds(s, id)));

  if (!node) return null;

  const handleSelect = (e: Konva.KonvaEventObject<Event>) => {
    e.cancelBubble = true;
    const isShift = Boolean((e.evt as MouseEvent | undefined)?.shiftKey);
    if (isShift) {
      toggleSelection(id);
    } else if (!isSelected) {
      setSelection([id]);
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const center = { x: e.target.x(), y: e.target.y() };
    updateNode(id, topLeftFromCenter(center, node));
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    commitTransform(id, e.target);
  };

  const center = nodeCenter(node);

  const shared: SharedShapeProps = {
    id,
    x: center.x,
    y: center.y,
    offsetX: node.width / 2,
    offsetY: node.height / 2,
    rotation: node.rotation,
    opacity: node.opacity,
    draggable: true,
    onClick: handleSelect,
    onTap: handleSelect,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  switch (node.type) {
    case "rect":
      return (
        <Rect
          {...shared}
          width={node.width}
          height={node.height}
          fill={node.fill}
          stroke={node.stroke ?? undefined}
          strokeWidth={node.strokeWidth}
          cornerRadius={node.cornerRadius}
        />
      );

    case "ellipse":
      return (
        <Ellipse
          {...shared}
          offsetX={0}
          offsetY={0}
          radiusX={node.width / 2}
          radiusY={node.height / 2}
          fill={node.fill}
          stroke={node.stroke ?? undefined}
          strokeWidth={node.strokeWidth}
        />
      );

    case "text":
      return (
        <Text
          {...shared}
          width={node.width}
          height={node.height}
          text={node.content ?? ""}
          fontSize={node.fontSize ?? 16}
          fontFamily={node.fontFamily ?? "sans-serif"}
          fontStyle={node.fontWeight && node.fontWeight >= 600 ? "bold" : "normal"}
          align={node.textAlign ?? "left"}
          fill={node.fill ?? "#e4e4e7"}
        />
      );

    case "image":
      return <ImageNode {...shared} node={node} />;

    case "frame": {
      const clip =
        node.clipsContent !== false
          ? { clipX: 0, clipY: 0, clipWidth: node.width, clipHeight: node.height }
          : {};
      return (
        <Group {...shared} {...clip}>
          <Rect
            x={0}
            y={0}
            width={node.width}
            height={node.height}
            fill={node.fill ?? "#18181b"}
            cornerRadius={node.cornerRadius ?? 0}
            listening={false}
          />
          {childIds.map((childId) => (
            <SceneNodeRenderer key={childId} id={childId} />
          ))}
        </Group>
      );
    }

    case "group":
      return (
        <Group {...shared}>
          {childIds.map((childId) => (
            <SceneNodeRenderer key={childId} id={childId} />
          ))}
        </Group>
      );

    default:
      return null;
  }
});

function ImageNode({ node, ...shared }: SharedShapeProps & { node: SceneNode }) {
  const [image] = useImage(node.src ?? "", "anonymous");

  return (
    <KonvaImage
      {...shared}
      image={image}
      width={node.width}
      height={node.height}
    />
  );
}
