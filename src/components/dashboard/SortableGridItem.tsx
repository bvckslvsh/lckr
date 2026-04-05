import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableGridItem({
  id,
  children,
  isMergeTarget,
}: {
  id: string;
  children: React.ReactNode;
  isMergeTarget?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.25 : 1,
      }}
      {...attributes}
      {...listeners}
      className={`touch-none outline-none ${
        isMergeTarget
          ? "ring-2 ring-blue-500 ring-offset-2 rounded-xl scale-[1.03]"
          : ""
      } transition-[transform,box-shadow]`}
    >
      {children}
    </div>
  );
}
