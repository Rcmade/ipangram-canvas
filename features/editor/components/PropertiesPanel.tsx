import React, { useEffect, useState } from "react";
import { FabricObject, TFiller } from "fabric";
import { useEditorStore } from "../store/editorStore";
import { Settings } from "lucide-react";

interface IEditorProperties {
  fill: string | TFiller | null;
  width: number;
  height: number;
  opacity: number;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
}

export const PropertiesPanel = () => {
  const { selectedObjects, updateProperty } = useEditorStore();
  const selectedObject = selectedObjects[0];

  const [props, setProps] = useState<IEditorProperties>(
    {} as IEditorProperties,
  );

  useEffect(() => {
    if (selectedObject) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProps({
        fill: selectedObject.fill,
        width: Math.round(selectedObject.width || 0),
        height: Math.round(selectedObject.height || 0),
        opacity: selectedObject.opacity || 1,
        left: Math.round(selectedObject.left || 0),
        top: Math.round(selectedObject.top || 0),
        scaleX: selectedObject.scaleX || 1,
        scaleY: selectedObject.scaleY || 1,
      });
    }
  }, [selectedObject]);

  const handleChange = (key: string, value: string | number) => {
    setProps((prev) => ({ ...prev, [key]: value }));
    updateProperty(key as keyof FabricObject, value);
  };

  if (!selectedObject) {
    return (
      <div className="flex flex-col h-full bg-background border-l border-gray-200 dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold flex items-center gap-2">
          <Settings size={20} />
          Properties
        </div>
        <div className="p-4 text-gray-500 text-sm">
          Select an element to edit properties
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border-l border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold flex items-center gap-2">
        <Settings size={20} />
        Properties
      </div>
      <div className="p-4 flex flex-col gap-4">
        {/* Fill Color */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">
            Fill
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={typeof props.fill === "string" ? props.fill : "#000000"}
              onChange={(e) => handleChange("fill", e.target.value)}
              className="w-8 h-8 rounded border"
            />
            <input
              type="text"
              value={typeof props.fill === "string" ? props.fill : ""}
              onChange={(e) => handleChange("fill", e.target.value)}
              className="flex-1 p-1 border rounded text-sm bg-transparent"
            />
          </div>
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              X
            </label>
            <input
              type="number"
              value={props.left || 0}
              onChange={(e) => handleChange("left", Number(e.target.value))}
              className="p-1 border rounded text-sm bg-transparent"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Y
            </label>
            <input
              type="number"
              value={props.top || 0}
              onChange={(e) => handleChange("top", Number(e.target.value))}
              className="p-1 border rounded text-sm bg-transparent"
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              W
            </label>
            <input
              type="number"
              value={Math.round((props.width || 0) * (props.scaleX || 1))}
              disabled
              className="p-1 border rounded text-sm bg-gray-100 dark:bg-gray-900 cursor-not-allowed text-gray-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">
              H
            </label>
            <input
              type="number"
              value={Math.round((props.height || 0) * (props.scaleY || 1))}
              disabled
              className="p-1 border rounded text-sm bg-gray-100 dark:bg-gray-900 cursor-not-allowed text-gray-500"
            />
          </div>
        </div>

        {/* Opacity */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">
            Opacity
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={props.opacity || 1}
            onChange={(e) => handleChange("opacity", Number(e.target.value))}
            className="w-full"
          />
          <div className="text-right text-xs text-gray-500">
            {Math.round((props.opacity || 1) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};
