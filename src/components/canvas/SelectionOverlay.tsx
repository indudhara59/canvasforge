"use client";

import * as React from "react";
import Konva from "konva";
import { Rect, Transformer } from "react-konva";

import { nodeCenter } from "@/lib/konva-geometry";
import { useSceneStore } from "@/store/sceneStore";

const ACCENT = "#6366f1";

interface SelectionOverlayProps {
  stageRef: React.RefObject<Konva.Stage>;
}

export function SelectionOverlay({ stageRef }: SelectionOverlayProps) {
  const selectedIds = useSceneStore((s) => s.selectedIds);
  const transformerRef = React.useRef<Konva.Transformer>(null);

  React.useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((n): n is Konva.Node => Boolean(n));

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, stageRef]);

  return (
    <>
      {selectedIds.map((id) => (
        <SelectionOutline key={id} id={id} />
      ))}

      <Transformer
        ref={transformerRef}
        rotateAnchorOffset={28}
        borderStroke={ACCENT}
        borderStrokeWidth={1.5}
        anchorStroke={ACCENT}
        anchorStrokeWidth={1.5}
        anchorFill="#ffffff"
        anchorSize={10}
        anchorCornerRadius={5}
        flipEnabled={false}
        anchorStyleFunc={(anchor) => {
          anchor.cornerRadius(anchor.width() / 2);
          anchor.shadowColor("#000000");
          anchor.shadowBlur(4);
          anchor.shadowOpacity(0.25);
          anchor.shadowOffsetY(1);
          anchor.shadowForStrokeEnabled(false);
        }}
      />
    </>
  );
}

/** A per-node highlight that fades + scales in over ~150ms when it's first selected. */
function SelectionOutline({ id }: { id: string }) {
  const node = useSceneStore((s) => s.nodes[id]);
  const rectRef = React.useRef<Konva.Rect>(null);

  React.useEffect(() => {
    const shape = rectRef.current;
    if (!shape) return;

    shape.opacity(0);
    shape.scaleX(0.92);
    shape.scaleY(0.92);
    shape.to({
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 0.15,
      easing: Konva.Easings.EaseOut,
    });
  }, [id]);

  if (!node) return null;

  const center = nodeCenter(node);

  return (
    <Rect
      ref={rectRef}
      x={center.x}
      y={center.y}
      offsetX={node.width / 2}
      offsetY={node.height / 2}
      width={node.width}
      height={node.height}
      rotation={node.rotation}
      stroke={ACCENT}
      strokeWidth={1.5}
      listening={false}
      perfectDrawEnabled={false}
    />
  );
}
