import React from "react";
import { Toolbar } from "./Toolbar";
import { LayersPanel } from "./LayersPanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { CanvasWorkspace } from "./CanvasWorkspace";

export const EditorLayout = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Top Toolbar */}
      <div className="h-16 flex-none z-10 relative">
        <Toolbar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar  */}
        <div className="w-64 flex-none z-10 relative">
          <LayersPanel />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 relative z-0">
          <CanvasWorkspace />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex-none z-10 relative">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
};
