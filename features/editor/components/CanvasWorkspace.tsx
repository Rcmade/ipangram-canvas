import React, { useEffect, useRef } from "react";
import { Canvas, FabricObject } from "fabric";
import { useEditorStore } from "../store/editorStore";
import { initSnapping } from "../utils/snappingHelpers";

export const CanvasWorkspace = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setCanvas = useEditorStore((state) => state.setCanvas);
  const setLayers = useEditorStore((state) => state.setLayers);
  const setSelectedObjects = useEditorStore(
    (state) => state.setSelectedObjects,
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 600,
      height: 350,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selectionKey: "shiftKey",
    });

    setCanvas(canvas);

    const updateLayers = () => {
      setLayers([...canvas.getObjects()]);
    };

    const updateSelection = (e: { selected: FabricObject[] }) => {
      const selected = e.selected || [];
      setSelectedObjects(selected);
    };

    const clearSelection = () => {
      setSelectedObjects([]);
    };

    canvas.on("object:added", updateLayers);
    canvas.on("object:removed", updateLayers);
    canvas.on("object:modified", updateLayers);

    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", clearSelection);

    // Initialize Snapping
    initSnapping(canvas);

    // History Tracking
    const saveState = () => useEditorStore.getState().saveHistory();

    canvas.on("object:added", () => {
      updateLayers();
      saveState();
    });
    canvas.on("object:removed", () => {
      updateLayers();
      saveState();
    });
    canvas.on("object:modified", () => {
      updateLayers();
      saveState();
    });

    // Save initial state
    saveState();

    // Keyboard Nudging & Undo/Redo
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        useEditorStore.getState().undo();
        return;
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "Z"))
      ) {
        e.preventDefault();
        useEditorStore.getState().redo();
        return;
      }

      const activeObj = canvas.getActiveObject();
      if (!activeObj) return;

      const step = e.shiftKey ? 10 : 1;
      let moved = false;

      switch (e.key) {
        case "ArrowLeft":
          activeObj.set("left", (activeObj.left || 0) - step);
          moved = true;
          break;
        case "ArrowRight":
          activeObj.set("left", (activeObj.left || 0) + step);
          moved = true;
          break;
        case "ArrowUp":
          activeObj.set("top", (activeObj.top || 0) - step);
          moved = true;
          break;
        case "ArrowDown":
          activeObj.set("top", (activeObj.top || 0) + step);
          moved = true;
          break;
      }

      if (moved) {
        e.preventDefault();
        activeObj.setCoords();
        canvas.requestRenderAll();
        canvas.fire("object:modified");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.dispose();
    };
  }, [setCanvas, setLayers, setSelectedObjects]);

  return (
    <div className="flex-1 bg-background flex items-center justify-center p-8 overflow-auto focus:outline-none">
      <div
        className="shadow-lg relative bg-white"
        style={{ width: 600, height: 350 }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
