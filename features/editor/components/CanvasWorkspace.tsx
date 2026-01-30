import React, { useEffect, useRef } from "react";
import { Canvas, FabricObject } from "fabric";
import { useEditorStore } from "../store/editorStore";

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

    return () => {
      canvas.dispose();
    };
  }, [setCanvas, setLayers, setSelectedObjects]);

  return (
    <div className="flex-1 bg-background flex items-center justify-center p-8 overflow-auto">
      <div className="shadow-lg relative" style={{ width: 600, height: 350 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
