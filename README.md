# iPangram Canvas Editor

A powerful, high-performance canvas editor built with **Next.js**, **Fabric.js**, and **Tailwind CSS**. This application offers a seamless design experience with advanced features like snapping, undo/redo, and multi-format export.

🔗 **Live Demo:** [https://ipangram-canvas.vercel.app/](https://ipangram-canvas.vercel.app/)

## 🚀 Features

- **Drag & Drop Editing**: Add shapes (Rectangle, Circle), Text, Images, and SVGs.
- **Advanced Manipulation**: Move, resize, and rotate objects with precision.
- **Smart Snapping**: Auto-alignment guides for perfect positioning.
- **History Management**: Robust Undo/Redo system using stack-based state snapshots.
- **Export Options**: Download designs as high-quality PNG, JPEG, or PDF.
- **Customizable**: Layer management and property editing (color, size, opacity).

## 🛠️ Tech Stack & Choices

### State Management: **Zustand**

I chose **Zustand** for state management over Redux or Context API for several reasons:

- **Simplicity & Minimal Boilerplate**: Zustand provides a clean, hook-based API without the complexity of reducers and actions.
- **Performance**: It solves the "zombie child" problem and unnecessary re-renders that can occur with React Context. Selectors allow components to subscribe only to specific slices of state.
- **Flexibility**: Easy integration with Fabric.js events outside the React component tree (accessing state via `useEditorStore.getState()`).

## 🧩 Implementation Details

### Snapping System

Snapping is implemented by hooking into Fabric.js's `object:moving` event.

- **Logic**: We calculate the edges (left, center, right, top, bottom) of the active object and compare them against all other objects on the canvas.
- **Threshold**: If an edge is within a specific pixel threshold (e.g., 10px) of another object's edge, we forcefully "snap" the position.
- **Visual Feedback**: Dynamic guide lines are drawn on the canvas to show alignment, which are cleared on `object:modified`.

### Undo/Redo History

The history system is built directly into the Zustand store (`editorStore.ts`):

- **Stacks**: Two separate stacks (`undoStack` and `redoStack`) store the canvas state as JSON strings.
- **Capture**: State is saved on specific Fabric events (`object:added`, `object:modified`, `object:removed`).
- **Optimization**: A `historyProcessing` flag prevents new history entries from being created while an undo/redo operation is in progress, avoiding loop conditions.

### Export Functionality

Exporting is handled using browser-side libraries to ensure privacy and speed (no backend required):

- **PNG/JPEG**: Utilizes Fabric.js's native `.toDataURL()` method with a `multiplier` of 4x to ensure high-resolution output regardless of the screen's pixel density.
- **PDF**: Integrates `jspdf` to create a standard PDF document, embedding the canvas as a high-quality image.

## ⚡ Performance Optimizations

1. **Render Batching**: Explicit calls to `canvas.requestRenderAll()` ensure that multiple property updates result in a single repaint frame.
2. **Selective State Subscriptions**: Components use Zustand selectors (e.g., `state => state.canvas`) to re-render only when relevant data changes.
3. **Event Throttling**: Snapping calculations are optimized to minimize overhead during drag operations.
4. **History JSON compression**: (Implicit) Storing minimal JSON representation of Fabric objects rather than full DOM snapshots.
5. **Lazy Loading**: Icons and heavy assets are loaded on demand.

## 📦 Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   ```

3. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000).

## 📄 License

MIT
