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
  Download,
} from "lucide-react";
import { useRef } from "react";
import { jsPDF } from "jspdf";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ThemeButton } from "@/components/buttons/ThemeButton";

export const Toolbar = () => {
  const { canvas } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  const handleExport = (format: "png" | "jpeg" | "pdf") => {
    if (!canvas) return;

    // Clear selection
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    if (format === "pdf") {
      const width = canvas.width || 600;
      const height = canvas.height || 350;

      const imgData = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2, // High resolution for PDF
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [width, height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("design.pdf");
    } else {
      const dataURL = canvas.toDataURL({
        format,
        quality: 1,
        multiplier: 4, // 4x resolution for images
      });

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `design.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-border bg-background">
      <Button onClick={addCircle}>
        <CircleIcon size={20} />
        <span className="text-xs">Circle</span>
      </Button>
      <Button onClick={addRect}>
        <Square size={20} />
        <span className="text-xs">Rect</span>
      </Button>
      <Button onClick={addText}>
        <Type size={20} />
        <span className="text-xs">Text</span>
      </Button>
      <Button onClick={handleImageClick}>
        <ImageIcon size={20} />
        <span className="text-xs">Image</span>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <StarIcon size={20} />
            <span className="text-xs">Icons</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32 grid grid-cols-2 gap-2 p-2">
          {Object.entries(ICONS).map(([name, svg]) => (
            <DropdownMenuItem
              key={name}
              onClick={() => addIcon(svg)}
              className="p-2 justify-center h-10 w-10 cursor-pointer"
              title={name}
            >
              <div dangerouslySetInnerHTML={{ __html: svg }} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ThemeButton />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="ml-auto flex gap-2 mr-5">
            <Download size={20} />
            <span className="text-xs">Export</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>Export</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport("png")}>
            Export PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("jpeg")}>
            Export JPG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("pdf")}>
            Export PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
