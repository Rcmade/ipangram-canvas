import React from "react";
import { useEditorStore } from "../store/editorStore";
import { Layers, Trash2, GripVertical } from "lucide-react";
import { FabricObject } from "fabric";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableLayerItemProps {
  id: string;
  obj: FabricObject;
  isSelected: boolean;
  onSelect: (obj: FabricObject) => void;
  onDelete: (e: React.MouseEvent, obj: FabricObject) => void;
}

const SortableLayerItem = ({
  id,
  obj,
  isSelected,
  onSelect,
  onDelete,
}: SortableLayerItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(obj)}
      className={`flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer border-b border-gray-100 dark:border-gray-800 ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-black"}`}
    >
      <div className="flex items-center gap-2 text-sm truncate">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>
        <span className="capitalize">{obj.type}</span>
      </div>
      <button
        onClick={(e) => onDelete(e, obj)}
        className="text-gray-400 hover:text-red-500"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export const LayersPanel = () => {
  const { layers, canvas, selectedObjects, setSelectedObjects, reorderLayers } =
    useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // active.id and over.id are indices (as strings)
      // BUT, be careful. The visible list is REVERSED from the 'layers' array.
      // layers array: [0: Bottom, 1: Middle, 2: Top]
      // visible list: [Top, Middle, Bottom]
      // So if I drag the first item in the list (Top, index 2 in array) to the second position (Middle, index 1 in array).

      // Actually, it's easier to map the IDs to the actual Fabric objects or stable IDs if we had them.
      // Since we are using "layer-{index}" based on the *store* array index, we need to be very careful.

      // Let's use the actual array index as the ID source, but we MUST preserve the mapping.
      // If the list is displayed reversed, index 0 in UI is layers.length-1 in Store.

      // Let's try to pass the 'layers' array reversed to SortableContext?
      // If we do that, we get indices 0, 1, 2... but corresponding to the reversed array.

      // Let's simplify:
      // The 'items' prop in SortableContext should be the list of IDs in the order they currently appear.
      // We display them reversed: `[...layers].reverse()`.
      // So the IDs in SortableContext should be reversed too.

      const oldIndexUi = parseInt(active.id as string);
      const newIndexUi = parseInt(over?.id as string);

      // However, Dnd-Kit sorts based on the `items` array order.
      // If we give it reversed IDs, it manages that.

      // Wait, "moving from UI index 0 to UI index 1"
      // UI index 0 = Store index (Layers.length - 1)
      // UI index 1 = Store index (Layers.length - 2)

      // It implies we need to calculate the store indices.
      // Let's rely on the fact that we can search for the object in the 'layers' array?
      // But we don't have stable IDs on objects yet.
      // We can use the index as ID, but that's risky if the array mutates.

      // Temporary solution: Use a simple generated ID based on instance equality?
      // Or just assign a random ID to each object when it's added?
      // Fabric objects usually don't have an ID.

      // Let's stick to using indices but carefully mapping them.
      // Better approach:
      // Pass [Layer N, Layer N-1, ... Layer 0] to SortableContext.
      // Drag event gives us: "I moved item 'Layer N' to position of 'Layer N-1'".
      // We can translate that back to the store indices.

      // Actually, we can just use `reorderLayers` with the *store* indices.
      // We need to know which store index corresponds to the dragged item.

      // Let's just create a stable ID map for the render cycle.
      // Or, simpler:
      // Let's pretend the list is NOT reversed for a moment to think about it.
      // If list is [0, 1, 2], dragging 0->1 calls reorder(0, 1).
      // Our visual list is reversed: [2, 1, 0].
      // Dragging top item (2) to middle (1).
      // reorder(2, 1).

      // We need to parse the ID to get the original store index.
      // `active.id` -> store index.
      // But `over.id` -> if we drop it *over* another item, we get that item's ID.

      // So:
      const oldIndex = parseInt(active.id.toString().replace("layer-", ""));
      const newIndex = parseInt(over!.id.toString().replace("layer-", ""));

      reorderLayers(oldIndex, newIndex);
    }
  };

  // Create reversible IDs.
  // Warning: indices change on every reorder.
  // DnD Kit likes stable IDs. If we use indices as IDs, animation might be weird.
  // But for now let's try.
  // We need to render the list in reverse order.
  const reversedLayers = [...layers]
    .map((obj, i) => ({ obj, index: i }))
    .reverse();
  const items = reversedLayers.map((l) => `layer-${l.index}`);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-semibold flex items-center gap-2">
        <Layers size={20} />
        Layers
      </div>
      <div className="flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items} // The order here dictates the sort order
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col">
              {reversedLayers.map(({ obj, index }) => (
                <SortableLayerItem
                  key={`layer-${index}`}
                  id={`layer-${index}`}
                  obj={obj}
                  isSelected={selectedObjects.includes(obj)}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {layers.length === 0 && (
          <div className="p-4 text-gray-500 text-sm italic">No layers</div>
        )}
      </div>
    </div>
  );
};
