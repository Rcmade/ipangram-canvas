import React from "react";
import { useEditorStore } from "../store/editorStore";
import { Layers, Trash2 } from "lucide-react";
import { FabricObject } from "fabric";

export const LayersPanel = () => {
  const { layers, canvas, selectedObjects, setSelectedObjects } =
    useEditorStore();

  const handleSelect = (obj: FabricObject) => {
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    setSelectedObjects([obj]);
  };

  const handleDelete = (e: React.MouseEvent, obj: FabricObject) => {
    e.stopPropagation();
    if (!canvas) return;
    canvas.remove(obj);
    canvas.requestRenderAll();
    // Layers update will be handled by the canvas event listener in CanvasWorkspace
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold flex items-center gap-2">
        <Layers size={20} />
        Layers
      </div>
      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm italic">No layers</div>
        ) : (
          <div className="flex flex-col">
            {/* Fabric renders last object on top, so we reverse to show top layer first in list */}
            {[...layers].reverse().map((obj, index) => (
              <div
                key={index} // Fabric objects don't always have IDs by default, using index for now but ideally should use obj.id
                onClick={() => handleSelect(obj)}
                className={`flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer border-b border-gray-100 dark:border-gray-800 ${selectedObjects.includes(obj) ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
              >
                <div className="flex items-center gap-2 text-sm truncate">
                  <span className="capitalize">{obj.type}</span>
                </div>
                <button
                  onClick={(e) => handleDelete(e, obj)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
