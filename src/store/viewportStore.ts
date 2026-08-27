import { create } from "zustand";

import type { Bounds } from "@/lib/scene-bounds";
import type { Viewport } from "@/types/scene";

interface ContainerSize {
  width: number;
  height: number;
}

const MIN_SCALE = 0.02;
const MAX_SCALE = 8;
const DEFAULT_PADDING = 64;

interface ViewportState extends Viewport {
  setViewport: (viewport: Partial<Viewport>) => void;
  zoomToFit: (bounds: Bounds, container: ContainerSize, padding?: number) => void;
  zoomToSelection: (bounds: Bounds, container: ContainerSize, padding?: number) => void;
}

/** Scale + offset that centers `bounds` inside `container`, with padding. */
function fitToBounds(bounds: Bounds, container: ContainerSize, padding: number): Viewport {
  const availableWidth = Math.max(container.width - padding * 2, 1);
  const availableHeight = Math.max(container.height - padding * 2, 1);

  const scaleX = availableWidth / Math.max(bounds.width, 1);
  const scaleY = availableHeight / Math.max(bounds.height, 1);
  const scale = Math.min(Math.max(Math.min(scaleX, scaleY), MIN_SCALE), MAX_SCALE);

  const contentCenterX = bounds.x + bounds.width / 2;
  const contentCenterY = bounds.y + bounds.height / 2;

  return {
    scale,
    x: container.width / 2 - contentCenterX * scale,
    y: container.height / 2 - contentCenterY * scale,
  };
}

export const useViewportStore = create<ViewportState>()((set) => ({
  x: 0,
  y: 0,
  scale: 1,

  setViewport: (viewport) => set((state) => ({ ...state, ...viewport })),

  zoomToFit: (bounds, container, padding = DEFAULT_PADDING) => {
    set(fitToBounds(bounds, container, padding));
  },

  zoomToSelection: (bounds, container, padding = DEFAULT_PADDING) => {
    set(fitToBounds(bounds, container, padding));
  },
}));
