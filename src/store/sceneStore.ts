import { create, useStore } from "zustand";
import { temporal, type TemporalState } from "zundo";

import { createNode } from "@/lib/create-node";
import type { SceneNode } from "@/types/scene";

export interface SceneData {
  nodes: Record<string, SceneNode>;
  rootIds: string[];
}

interface SceneActions {
  setScene: (data: SceneData) => void;

  addNode: (input: Partial<SceneNode> & Pick<SceneNode, "type">) => string;
  updateNode: (id: string, changes: Partial<SceneNode>) => void;
  updateNodes: (changes: Record<string, Partial<SceneNode>>) => void;
  deleteNode: (id: string) => void;
  deleteNodes: (ids: string[]) => void;
  duplicateNode: (id: string) => string | null;
  reparentNode: (id: string, parentId: string | null, index?: number) => void;

  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;

  selectedIds: string[];
  setSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
}

export type SceneState = SceneData & SceneActions;

/** Ids of the direct children of `parentId` (or root, if null), in z-order. */
export function getOrderedChildIds(state: SceneData, parentId: string | null): string[] {
  if (parentId === null) return state.rootIds;

  return Object.values(state.nodes)
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((node) => node.id);
}

/** A node's id plus every descendant's id, via parentId chains. */
function getSubtreeIds(nodes: Record<string, SceneNode>, rootId: string): string[] {
  const ids = [rootId];
  const stack = [rootId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const node of Object.values(nodes)) {
      if (node.parentId === current) {
        ids.push(node.id);
        stack.push(node.id);
      }
    }
  }

  return ids;
}

/** Reassigns zIndex 0..n-1 to `orderedIds`, and syncs rootIds if `parentId` is root. */
function reindexSiblings(
  state: SceneData,
  parentId: string | null,
  orderedIds: string[],
): SceneData {
  const nodes = { ...state.nodes };
  orderedIds.forEach((id, index) => {
    nodes[id] = { ...nodes[id], zIndex: index };
  });

  return {
    nodes,
    rootIds: parentId === null ? orderedIds : state.rootIds,
  };
}

function moveWithinSiblings(
  state: SceneData,
  id: string,
  move: (ids: string[], index: number) => string[],
): SceneData {
  const node = state.nodes[id];
  if (!node) return state;

  const siblings = getOrderedChildIds(state, node.parentId);
  const index = siblings.indexOf(id);
  if (index === -1) return state;

  const reordered = move(siblings, index);
  return reindexSiblings(state, node.parentId, reordered);
}

export const useSceneStore = create<SceneState>()(
  temporal(
    (set, get) => ({
      nodes: {},
      rootIds: [],
      selectedIds: [],

      setScene: (data) => set({ nodes: data.nodes, rootIds: data.rootIds, selectedIds: [] }),

      addNode: (input) => {
        const parentId = input.parentId ?? null;
        const siblingCount = getOrderedChildIds(get(), parentId).length;
        const node = createNode({ ...input, parentId, zIndex: siblingCount });

        set((state) => ({
          nodes: { ...state.nodes, [node.id]: node },
          rootIds: parentId === null ? [...state.rootIds, node.id] : state.rootIds,
        }));

        return node.id;
      },

      updateNode: (id, changes) => {
        set((state) => {
          const existing = state.nodes[id];
          if (!existing) return state;
          return { nodes: { ...state.nodes, [id]: { ...existing, ...changes } } };
        });
      },

      updateNodes: (changes) => {
        set((state) => {
          const nodes = { ...state.nodes };
          for (const [id, patch] of Object.entries(changes)) {
            if (nodes[id]) nodes[id] = { ...nodes[id], ...patch };
          }
          return { nodes };
        });
      },

      deleteNode: (id) => get().deleteNodes([id]),

      deleteNodes: (ids) => {
        set((state) => {
          const toDelete = new Set(ids.flatMap((id) => getSubtreeIds(state.nodes, id)));

          const nodes = { ...state.nodes };
          for (const id of toDelete) delete nodes[id];

          return {
            nodes,
            rootIds: state.rootIds.filter((id) => !toDelete.has(id)),
            selectedIds: state.selectedIds.filter((id) => !toDelete.has(id)),
          };
        });
      },

      duplicateNode: (id) => {
        const state = get();
        const source = state.nodes[id];
        if (!source) return null;

        const subtreeIds = getSubtreeIds(state.nodes, id);
        const idMap = new Map(subtreeIds.map((originalId) => [originalId, crypto.randomUUID()]));

        const siblingCount = getOrderedChildIds(state, source.parentId).length;
        const clones: Record<string, SceneNode> = {};

        for (const originalId of subtreeIds) {
          const original = state.nodes[originalId];
          const newId = idMap.get(originalId)!;
          clones[newId] = {
            ...original,
            id: newId,
            parentId:
              originalId === id
                ? original.parentId
                : (idMap.get(original.parentId ?? "") ?? original.parentId),
            x: originalId === id ? original.x + 16 : original.x,
            y: originalId === id ? original.y + 16 : original.y,
            zIndex: originalId === id ? siblingCount : original.zIndex,
          };
        }

        const newId = idMap.get(id)!;

        set((s) => ({
          nodes: { ...s.nodes, ...clones },
          rootIds: source.parentId === null ? [...s.rootIds, newId] : s.rootIds,
        }));

        return newId;
      },

      reparentNode: (id, parentId, index) => {
        set((state) => {
          const node = state.nodes[id];
          if (!node || id === parentId) return state;

          const oldParentId = node.parentId;
          const oldSiblings = getOrderedChildIds(state, oldParentId).filter((sid) => sid !== id);
          const withoutNode = reindexSiblings(state, oldParentId, oldSiblings);

          const newSiblingsBase = getOrderedChildIds(withoutNode, parentId);
          const insertAt = index === undefined ? newSiblingsBase.length : index;
          const newSiblings = [
            ...newSiblingsBase.slice(0, insertAt),
            id,
            ...newSiblingsBase.slice(insertAt),
          ];

          const moved: SceneData = {
            nodes: { ...withoutNode.nodes, [id]: { ...withoutNode.nodes[id], parentId } },
            rootIds: withoutNode.rootIds,
          };

          return reindexSiblings(moved, parentId, newSiblings);
        });
      },

      bringToFront: (id) => {
        set((state) =>
          moveWithinSiblings(state, id, (ids, index) => [
            ...ids.slice(0, index),
            ...ids.slice(index + 1),
            id,
          ]),
        );
      },

      sendToBack: (id) => {
        set((state) =>
          moveWithinSiblings(state, id, (ids, index) => [
            id,
            ...ids.slice(0, index),
            ...ids.slice(index + 1),
          ]),
        );
      },

      bringForward: (id) => {
        set((state) =>
          moveWithinSiblings(state, id, (ids, index) => {
            if (index >= ids.length - 1) return ids;
            const next = [...ids];
            [next[index], next[index + 1]] = [next[index + 1], next[index]];
            return next;
          }),
        );
      },

      sendBackward: (id) => {
        set((state) =>
          moveWithinSiblings(state, id, (ids, index) => {
            if (index <= 0) return ids;
            const next = [...ids];
            [next[index], next[index - 1]] = [next[index - 1], next[index]];
            return next;
          }),
        );
      },

      setSelection: (ids) => set({ selectedIds: ids }),

      toggleSelection: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        })),

      clearSelection: () => set({ selectedIds: [] }),
    }),
    {
      limit: 100,
      partialize: (state) => ({ nodes: state.nodes, rootIds: state.rootIds }),
      equality: (a, b) => a.nodes === b.nodes && a.rootIds === b.rootIds,
    },
  ),
);

export function useSceneTemporalStore<T>(
  selector: (state: TemporalState<SceneData>) => T,
): T {
  return useStore(useSceneStore.temporal, selector);
}
