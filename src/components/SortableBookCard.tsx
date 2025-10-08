import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Book } from "@/types/book";
import { BookCard } from "./BookCard";

interface SortableBookCardProps {
  book: Book;
}

export const SortableBookCard = ({ book }: SortableBookCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: book.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BookCard book={book} isDragging={isDragging} />
    </div>
  );
};
