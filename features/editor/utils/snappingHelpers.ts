import { Canvas, FabricObject, Line } from "fabric";

const SNAP_DIST = 10;
const GUIDELINE_COLOR = "rgba(255, 0, 0, 0.5)"; // Red-ish guide
const GUIDELINE_WIDTH = 1;

interface VerticalLineCoords {
  x: number;
  y1: number;
  y2: number;
}

interface HorizontalLineCoords {
  y: number;
  x1: number;
  x2: number;
}

/**
 * Initialize snapping guidelines for a fabric canvas.
 * Handles dragging events to snap objects to:
 * 1. Canvas center (horizontally and vertically)
 * 2. Edges of other objects (optional - for now let's stick to canvas center/edge snapping or basic alignment)
 *
 * For this implementation, we'll focus on Canvas Center snapping and basic alignment.
 */
export const initSnapping = (canvas: Canvas) => {
  let verticalLines: Line[] = [];
  let horizontalLines: Line[] = [];

  const clearGuidelines = () => {
    // Remove old lines
    verticalLines.forEach((line) => canvas.remove(line));
    horizontalLines.forEach((line) => canvas.remove(line));
    verticalLines = [];
    horizontalLines = [];
  };

  const drawVerticalLine = (coords: VerticalLineCoords) => {
    const line = new Line([coords.x, coords.y1, coords.x, coords.y2], {
      stroke: GUIDELINE_COLOR,
      strokeWidth: GUIDELINE_WIDTH,
      selectable: false,
      evented: false,
      strokeDashArray: [4, 4], // Dashed line
    });
    verticalLines.push(line);
    canvas.add(line);
  };

  const drawHorizontalLine = (coords: HorizontalLineCoords) => {
    const line = new Line([coords.x1, coords.y, coords.x2, coords.y], {
      stroke: GUIDELINE_COLOR,
      strokeWidth: GUIDELINE_WIDTH,
      selectable: false,
      evented: false,
      strokeDashArray: [4, 4],
    });
    horizontalLines.push(line);
    canvas.add(line);
  };

  canvas.on("object:moving", (e) => {
    const obj = e.target;
    if (!obj) return;

    // Clear previous lines
    clearGuidelines();

    const canvasWidth = canvas.width || 600;
    const canvasHeight = canvas.height || 350;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Use getCenterPoint for more accurate center regardless of origin
    const objCenter = obj.getCenterPoint();

    // Check Vertical Snap (Center X)
    if (Math.abs(objCenter.x - centerX) < SNAP_DIST) {
      // Snap to center X
      obj.set({ left: centerX - (objCenter.x - obj.left) }); // Adjust left based on center drift
      obj.setCoords();

      drawVerticalLine({
        x: centerX,
        y1: 0,
        y2: canvasHeight,
      });
    }

    // Check Horizontal Snap (Center Y)
    if (Math.abs(objCenter.y - centerY) < SNAP_DIST) {
      // Snap to center Y
      obj.set({ top: centerY - (objCenter.y - obj.top) });
      obj.setCoords();

      drawHorizontalLine({
        y: centerY,
        x1: 0,
        x2: canvasWidth,
      });
    }
  });

  canvas.on("object:modified", clearGuidelines); // Clear on drop
  canvas.on("mouse:up", clearGuidelines);
};
