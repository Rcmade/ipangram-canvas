import React, { useEffect, useRef, useState } from "react";
import { FabricObject, TFiller, IText, FabricImage } from "fabric";
import { useEditorStore } from "../store/editorStore";
import {
  Settings,
  Bold,
  Italic,
  Type,
  Image as ImageIcon,
  Palette,
} from "lucide-react";

interface IEditorProperties {
  fill: string | TFiller | null;
  stroke: string | TFiller | null;
  strokeWidth: number;
  width: number;
  height: number;
  opacity: number;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number; // Added angle
  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: string;
}

export const PropertiesPanel = () => {
  const {
    selectedObjects,
    updateProperty,
    setDimensions,
    setRotation,
    canvas,
  } = useEditorStore();
  const selectedObject = selectedObjects[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [props, setProps] = useState<IEditorProperties>(
    {} as IEditorProperties,
  );

  useEffect(() => {
    if (selectedObject) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProps({
        fill: selectedObject.fill,
        stroke: selectedObject.stroke || null,
        strokeWidth: selectedObject.strokeWidth || 0,
        width: Math.round(selectedObject.width || 0),
        height: Math.round(selectedObject.height || 0),
        opacity: selectedObject.opacity || 1,
        left: Math.round(selectedObject.left || 0),
        top: Math.round(selectedObject.top || 0),
        scaleX: selectedObject.scaleX || 1,
        scaleY: selectedObject.scaleY || 1,
        angle: selectedObject.angle || 0, // Sync angle
        // Text specific
        text: (selectedObject as IText).text,
        fontSize: (selectedObject as IText).fontSize,
        fontFamily: (selectedObject as IText).fontFamily,
        fontWeight: (selectedObject as IText).fontWeight,
        fontStyle: (selectedObject as IText).fontStyle,
        textAlign: (selectedObject as IText).textAlign,
      });
    }
  }, [selectedObject]);

  const handleChange = (
    key: string,
    value: string | number | boolean | null,
  ) => {
    setProps((prev) => ({ ...prev, [key]: value }));

    // Special handling for width/height/rotation
    if (key === "width") {
      const currentHeight = Math.round(
        (props.height || 0) * (props.scaleY || 1),
      );
      setDimensions(value as number, currentHeight);
    } else if (key === "height") {
      const currentWidth = Math.round((props.width || 0) * (props.scaleX || 1));
      setDimensions(currentWidth, value as number);
    } else if (key === "angle") {
      setRotation(value as number);
    } else {
      updateProperty(key as keyof FabricObject, value);
    }
  };

  const handleImageReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !canvas ||
      !selectedObject ||
      !(selectedObject instanceof FabricImage) ||
      !e.target.files ||
      e.target.files.length === 0
    )
      return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const imgObj = event.target?.result as string;
      if (!imgObj) return;

      try {
        const newImg = await FabricImage.fromURL(imgObj);
        selectedObject.setElement(newImg.getElement());
        selectedObject.setCoords();
        canvas.requestRenderAll();
      } catch (error) {
        console.error("Failed to replace image", error);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
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

  const isText =
    selectedObject.type === "i-text" || selectedObject.type === "text";
  const isImage = selectedObject.type === "image";

  return (
    <div className="flex flex-col h-full bg-background border-l border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={20} />
          <span>Properties</span>
        </div>
        <span className="text-xs text-gray-500 uppercase bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {selectedObject.type}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Dimensions & Position */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
            Layout
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {/* Position */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 uppercase">X</label>
              <input
                type="number"
                value={props.left || 0}
                onChange={(e) => handleChange("left", Number(e.target.value))}
                className="p-1 border rounded text-sm bg-transparent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 uppercase">Y</label>
              <input
                type="number"
                value={props.top || 0}
                onChange={(e) => handleChange("top", Number(e.target.value))}
                className="p-1 border rounded text-sm bg-transparent"
              />
            </div>

            {/* Dimensions */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 uppercase">W</label>
              <input
                type="number"
                value={Math.round((props.width || 0) * (props.scaleX || 1))}
                onChange={(e) => handleChange("width", Number(e.target.value))}
                disabled={selectedObject.type === "activeSelection"}
                className={`p-1 border rounded text-sm bg-transparent ${selectedObject.type === "activeSelection" ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 uppercase">H</label>
              <input
                type="number"
                value={Math.round((props.height || 0) * (props.scaleY || 1))}
                onChange={(e) => handleChange("height", Number(e.target.value))}
                disabled={selectedObject.type === "activeSelection"}
                className={`p-1 border rounded text-sm bg-transparent ${selectedObject.type === "activeSelection" ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Rotation */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 uppercase">
                Rotation
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={Math.round(props.angle || 0)}
                  onChange={(e) =>
                    handleChange("angle", Number(e.target.value))
                  }
                  className="p-1 border rounded text-sm bg-transparent flex-1"
                />
                <span className="text-xs text-gray-400">deg</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <label className="text-[10px] text-gray-400 uppercase">
              Opacity
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={props.opacity || 1}
                onChange={(e) =>
                  handleChange("opacity", Number(e.target.value))
                }
                className="flex-1"
              />
              <span className="text-xs w-8 text-right">
                {Math.round((props.opacity || 1) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Text Properties */}
        {isText && (
          <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
              <Type size={14} /> Text
            </h3>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={props.text || ""}
                onChange={(e) => handleChange("text", e.target.value)}
                className="p-1 border rounded text-sm bg-transparent w-full"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={props.fontFamily}
                  onChange={(e) => handleChange("fontFamily", e.target.value)}
                  className="p-1 border rounded text-xs bg-transparent"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                </select>
                <input
                  type="number"
                  value={props.fontSize || 12}
                  onChange={(e) =>
                    handleChange("fontSize", Number(e.target.value))
                  }
                  className="p-1 border rounded text-sm bg-transparent"
                />
              </div>
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 p-1 rounded justify-center">
                <button
                  onClick={() =>
                    handleChange(
                      "fontWeight",
                      props.fontWeight === "bold" ? "normal" : "bold",
                    )
                  }
                  className={`p-1 rounded ${props.fontWeight === "bold" ? "bg-white dark:bg-black shadow" : "hover:bg-white dark:hover:bg-black"}`}
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={() =>
                    handleChange(
                      "fontStyle",
                      props.fontStyle === "italic" ? "normal" : "italic",
                    )
                  }
                  className={`p-1 rounded ${props.fontStyle === "italic" ? "bg-white dark:bg-black shadow" : "hover:bg-white dark:hover:bg-black"}`}
                >
                  <Italic size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={
                      typeof props.fill === "string" ? props.fill : "#000000"
                    }
                    onChange={(e) => handleChange("fill", e.target.value)}
                    className="w-full h-8 rounded border cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Properties */}
        {isImage && (
          <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
              <ImageIcon size={14} /> Image
            </h3>
            <button
              onClick={handleImageReplaceClick}
              className="w-full py-2 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <ImageIcon size={14} /> Replace Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageReplace}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

        {/* Shape Appearance (Fill/Stroke) */}
        {!isImage && !isText && (
          <div className="flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
              <Palette size={14} /> Appearance
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase">
                  Fill
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={
                      typeof props.fill === "string" ? props.fill : "#000000"
                    }
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
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 uppercase">
                  Stroke
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={
                      typeof props.stroke === "string"
                        ? props.stroke
                        : "#000000"
                    }
                    onChange={(e) => handleChange("stroke", e.target.value)}
                    className="w-8 h-8 rounded border"
                  />
                  <input
                    type="number"
                    min="0"
                    value={props.strokeWidth || 0}
                    onChange={(e) =>
                      handleChange("strokeWidth", Number(e.target.value))
                    }
                    className="flex-1 p-1 border rounded text-sm bg-transparent"
                    placeholder="Width"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
