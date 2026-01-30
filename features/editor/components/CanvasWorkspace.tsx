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

    // Resolve the CSS variable for background color
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue("--background").trim();

    // Fallback if variable is missing or empty
    const finalColor = bgColor || "#ffffff";

    const canvas = new Canvas(canvasRef.current, {
      width: 600,
      height: 350,
      backgroundColor: finalColor,
      preserveObjectStacking: true,
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

    // Keyboard Nudging
    const handleKeyDown = (e: KeyboardEvent) => {
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
      <div className="shadow-lg relative" style={{ width: 600, height: 350 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
