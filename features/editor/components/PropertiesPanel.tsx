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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
      <div className="flex flex-col h-full bg-background border-l border-border">
        <div className="p-4 border-b border-border font-semibold flex items-center gap-2 text-foreground">
          <Settings size={20} />
          Properties
        </div>
        <div className="p-4 text-muted-foreground text-sm">
          Select an element to edit properties
        </div>
      </div>
    );
  }

  const isText =
    selectedObject.type === "i-text" || selectedObject.type === "text";
  const isImage = selectedObject.type === "image";

  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      <div className="p-4 border-b border-border font-semibold flex items-center justify-between text-foreground">
        <div className="flex items-center gap-2">
          <Settings size={20} />
          <span>Properties</span>
        </div>
        <span className="text-xs text-muted-foreground uppercase bg-muted px-2 py-1 rounded">
          {selectedObject.type}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Dimensions & Position */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
            Layout
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Position */}
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] text-muted-foreground uppercase">
                X
              </Label>
              <Input
                type="number"
                value={props.left || 0}
                onChange={(e) => handleChange("left", Number(e.target.value))}
                className="h-8"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] text-muted-foreground uppercase">
                Y
              </Label>
              <Input
                type="number"
                value={props.top || 0}
                onChange={(e) => handleChange("top", Number(e.target.value))}
                className="h-8"
              />
            </div>

            {/* Dimensions */}
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] text-muted-foreground uppercase">
                W
              </Label>
              <Input
                type="number"
                value={Math.round((props.width || 0) * (props.scaleX || 1))}
                onChange={(e) => handleChange("width", Number(e.target.value))}
                disabled={selectedObject.type === "activeSelection"}
                className="h-8"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] text-muted-foreground uppercase">
                H
              </Label>
              <Input
                type="number"
                value={Math.round((props.height || 0) * (props.scaleY || 1))}
                onChange={(e) => handleChange("height", Number(e.target.value))}
                disabled={selectedObject.type === "activeSelection"}
                className="h-8"
              />
            </div>

            {/* Rotation */}
            <div className="flex flex-col gap-2 col-span-2">
              <Label className="text-[10px] text-muted-foreground uppercase">
                Rotation (deg)
              </Label>
              <Input
                type="number"
                value={Math.round(props.angle || 0)}
                onChange={(e) => handleChange("angle", Number(e.target.value))}
                className="h-8"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Label className="text-[10px] text-muted-foreground uppercase">
              Opacity ({Math.round((props.opacity || 1) * 100)}%)
            </Label>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={[props.opacity || 1]}
              onValueChange={(vals) => handleChange("opacity", vals[0])}
            />
          </div>
        </div>

        {/* Text Properties */}
        {isText && (
          <div className="flex flex-col gap-4">
            <Separator />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Type size={14} /> Text
            </h3>
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                value={props.text || ""}
                onChange={(e) => handleChange("text", e.target.value)}
                className="h-8"
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={props.fontFamily}
                  onValueChange={(val) => handleChange("fontFamily", val)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">
                      Times New Roman
                    </SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={props.fontSize || 12}
                  onChange={(e) =>
                    handleChange("fontSize", Number(e.target.value))
                  }
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-1 bg-muted p-1 rounded justify-center">
                <Button
                  variant={props.fontWeight === "bold" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    handleChange(
                      "fontWeight",
                      props.fontWeight === "bold" ? "normal" : "bold",
                    )
                  }
                >
                  <Bold size={14} />
                </Button>
                <Button
                  variant={props.fontStyle === "italic" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    handleChange(
                      "fontStyle",
                      props.fontStyle === "italic" ? "normal" : "italic",
                    )
                  }
                >
                  <Italic size={14} />
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] text-muted-foreground uppercase">
                  Color
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={
                      typeof props.fill === "string" ? props.fill : "#000000"
                    }
                    onChange={(e) => handleChange("fill", e.target.value)}
                    className="w-full h-8 p-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Properties */}
        {isImage && (
          <div className="flex flex-col gap-4">
            <Separator />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <ImageIcon size={14} /> Image
            </h3>
            <Button
              variant="secondary"
              onClick={handleImageReplaceClick}
              className="w-full"
            >
              <ImageIcon size={14} className="mr-2" /> Replace Image
            </Button>
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
          <div className="flex flex-col gap-4">
            <Separator />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
              <Palette size={14} /> Appearance
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] text-muted-foreground uppercase">
                  Fill
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={
                      typeof props.fill === "string" ? props.fill : "#000000"
                    }
                    onChange={(e) => handleChange("fill", e.target.value)}
                    className="w-8 h-8 p-0 border-0"
                  />
                  <Input
                    type="text"
                    value={typeof props.fill === "string" ? props.fill : ""}
                    onChange={(e) => handleChange("fill", e.target.value)}
                    className="flex-1 h-8"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[10px] text-muted-foreground uppercase">
                  Stroke
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={
                      typeof props.stroke === "string"
                        ? props.stroke
                        : "#000000"
                    }
                    onChange={(e) => handleChange("stroke", e.target.value)}
                    className="w-8 h-8 p-0 border-0"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={props.strokeWidth || 0}
                    onChange={(e) =>
                      handleChange("strokeWidth", Number(e.target.value))
                    }
                    className="flex-1 h-8"
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
