import { create } from "zustand";
import { Canvas, FabricObject } from "fabric";

interface EditorState {
  canvas: Canvas | null;
  selectedObjects: FabricObject[];
  layers: FabricObject[];
  setCanvas: (canvas: Canvas) => void;
  setLayers: (layers: FabricObject[]) => void;
  setSelectedObjects: (objects: FabricObject[]) => void;
  updateProperty: (
    key: keyof FabricObject,
    value: string | number | boolean | null,
  ) => void;
  reorderLayers: (oldIndex: number, newIndex: number) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  selectedObjects: [],
  layers: [],
  setCanvas: (canvas) => set({ canvas }),
  setLayers: (layers) => set({ layers }),
  setSelectedObjects: (objects) => set({ selectedObjects: objects }),
  updateProperty: (key, value) => {
    const { canvas, selectedObjects } = get();
    if (!canvas || selectedObjects.length === 0) return;

    selectedObjects.forEach((obj) => {
      obj.set(key, value);
    });

    canvas.requestRenderAll();
    // trigger update
    set({ selectedObjects: [...selectedObjects] });
  },
  reorderLayers: (oldIndex, newIndex) => {
    const { canvas, layers } = get();
    if (!canvas || !layers[oldIndex]) return;

    const obj = layers[oldIndex];

    canvas.moveObjectTo(obj, newIndex);
    canvas.requestRenderAll();

    set({ layers: [...canvas.getObjects()] });
  },
}));
