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
      // FabricObject.set supports key/value pairs.
      // We cast key to string because Fabric's set method signature expects string or object
      obj.set(key as string, value);
    });

    canvas.requestRenderAll();
    // trigger update
    set({ selectedObjects: [...selectedObjects] });
  },
}));
