import {
  Circle,
  Rect,
  IText,
  FabricImage,
  loadSVGFromString,
  Group,
} from "fabric";
import { useEditorStore } from "../store/editorStore";
import { ICONS } from "../utils/iconLibrary";
import {
  Circle as CircleIcon,
  Square,
  Type,
  Image as ImageIcon,
  Star as StarIcon,
} from "lucide-react";
import { useRef, useState } from "react";

export const Toolbar = () => {
  const { canvas } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const addCircle = () => {
    if (!canvas) return;
    const circle = new Circle({
      radius: 50,
      fill: "#ff0000",
      left: 100,
      top: 100,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
  };

  const addRect = () => {
    if (!canvas) return;
    const rect = new Rect({
      width: 100,
      height: 100,
      fill: "#00ff00",
      left: 150,
      top: 150,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
  };

  const addText = () => {
    if (!canvas) return;
    const text = new IText("Hello World", {
      left: 200,
      top: 200,
      fontSize: 24,
      fill: "#000000",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const imgObj = event.target?.result as string;
      if (!imgObj) return;

      try {
        const img = await FabricImage.fromURL(imgObj);
        img.scaleToWidth(200);
        canvas.add(img);
        canvas.centerObject(img);
        canvas.setActiveObject(img);
      } catch (error: unknown) {
        console.error("Failed to load image", error);
      }
    };

    reader.readAsDataURL(file);
    // Reset value to allow selecting same file again
    e.target.value = "";
  };

  const addIcon = async (svgString: string) => {
    if (!canvas) return;
    try {
      const result = await loadSVGFromString(svgString);
      const objects = result.objects.filter((obj) => obj !== null);
      if (objects && objects.length > 0) {
        const icon = new Group(objects);
        icon.scaleToWidth(100);
        canvas.add(icon);
        canvas.centerObject(icon);
        canvas.setActiveObject(icon);
      }
    } catch (e) {
      console.error("Failed to add icon", e);
    }
    setShowIconPicker(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white dark:bg-black dark:border-gray-800">
      <button
        onClick={addCircle}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex flex-col items-center gap-1"
      >
        <CircleIcon size={20} />
        <span className="text-xs">Circle</span>
      </button>
      <button
        onClick={addRect}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex flex-col items-center gap-1"
      >
        <Square size={20} />
        <span className="text-xs">Rect</span>
      </button>
      <button
        onClick={addText}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex flex-col items-center gap-1"
      >
        <Type size={20} />
        <span className="text-xs">Text</span>
      </button>
      <button
        onClick={handleImageClick}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex flex-col items-center gap-1"
      >
        <ImageIcon size={20} />
        <span className="text-xs">Image</span>
      </button>

      <div className="relative">
        <button
          onClick={() => setShowIconPicker(!showIconPicker)}
          className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex flex-col items-center gap-1 ${showIconPicker ? "bg-gray-100 dark:bg-gray-800" : ""}`}
        >
          <StarIcon size={20} />
          <span className="text-xs">Icons</span>
        </button>

        {showIconPicker && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg grid grid-cols-2 gap-2 z-50 w-32">
            {Object.entries(ICONS).map(([name, svg]) => (
              <button
                key={name}
                onClick={() => addIcon(svg)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center justify-center border border-transparent hover:border-gray-200 dark:hover:border-gray-700 h-10 w-10"
                dangerouslySetInnerHTML={{ __html: svg }}
                title={name}
              />
            ))}
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
