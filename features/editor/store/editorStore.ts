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
  setDimensions: (width: number, height: number) => void;
  setRotation: (angle: number) => void;
  // History
  undoStack: string[];
  redoStack: string[];
  historyProcessing: boolean;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
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
  setDimensions: (width, height) => {
    const { canvas, selectedObjects } = get();
    if (!canvas || selectedObjects.length === 0) return;

    selectedObjects.forEach((obj) => {
      // If it's a group or we want to simulate resizing by scaling:
      // Object width/height in Fabric are "local" dimensions.
      // To resize visually on canvas we modify scaleX/scaleY usually,
      // OR we modify width/height and reset scale to 1.

      // Best practice for inputs:
      // If input W = 200, and object W = 100, scaleX = 2.
      // We calculate required scale.

      if (obj.width && obj.height) {
        const scaleX = width / obj.width;
        const scaleY = height / obj.height;
        obj.set({ scaleX, scaleY });
      }

      // Update coords
      obj.setCoords();
    });

    canvas.requestRenderAll();
    set({ selectedObjects: [...selectedObjects] });
  },
  setRotation: (angle) => {
    const { canvas, selectedObjects } = get();
    if (!canvas || selectedObjects.length === 0) return;

    selectedObjects.forEach((obj) => {
      // Normalize angle 0-360 if preferred, but Fabric accepts any.
      obj.set("angle", angle);
      obj.setCoords();
    });

    canvas.requestRenderAll();
    set({ selectedObjects: [...selectedObjects] });
  },

  // History
  undoStack: [],
  redoStack: [],
  historyProcessing: false, // Flag to prevent saving history during undo/redo

  saveHistory: () => {
    const { canvas, historyProcessing, undoStack } = get();
    if (!canvas || historyProcessing) return;

    const json = JSON.stringify(canvas.toJSON());

    // Avoid duplicates if possible (simple check)
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === json)
      return;

    set({
      undoStack: [...undoStack, json],
      redoStack: [], // Clear redo on new action
    });
  },

  undo: async () => {
    const { canvas, undoStack, redoStack, historyProcessing } = get();
    if (!canvas || undoStack.length === 0 || historyProcessing) return;

    set({ historyProcessing: true });

    // Current state -> redo stack
    const currentJson = JSON.stringify(canvas.toJSON());
    const prevState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    set({
      undoStack: newUndoStack,
      redoStack: [...redoStack, currentJson],
    });

    await canvas.loadFromJSON(JSON.parse(prevState));
    canvas.requestRenderAll();

    // Refresh layers and selection triggers
    set({
      layers: [...canvas.getObjects()],
      selectedObjects: [], // Clear selection to avoid stale references
      historyProcessing: false,
    });
  },

  redo: async () => {
    const { canvas, undoStack, redoStack, historyProcessing } = get();
    if (!canvas || redoStack.length === 0 || historyProcessing) return;

    set({ historyProcessing: true });

    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    // Current state -> undo stack
    const currentJson = JSON.stringify(canvas.toJSON());

    set({
      undoStack: [...undoStack, currentJson],
      redoStack: newRedoStack,
    });

    await canvas.loadFromJSON(JSON.parse(nextState));
    canvas.requestRenderAll();

    set({
      layers: [...canvas.getObjects()],
      selectedObjects: [],
      historyProcessing: false,
    });
  },
}));
