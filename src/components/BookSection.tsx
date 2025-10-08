import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Book } from "@/types/book";
import { SortableBookCard } from "./SortableBookCard";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface BookSectionProps {
  title: string;
  books: Book[];
  droppableId: string;
  icon: "reading" | "completed";
}

export const BookSection = ({ title, books, droppableId, icon }: BookSectionProps) => {
  const Icon = icon === "reading" ? BookOpen : CheckCircle2;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });
  
  return (
    <div className="flex-1 min-w-[300px]">
      <div className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-xl p-6 shadow-glow-primary">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-cosmic rounded-lg">
            <Icon className="w-6 h-6 text-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground bg-gradient-holographic bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
            {title}
          </h2>
          <span className="ml-auto text-sm font-semibold px-3 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
            {books.length}
          </span>
        </div>
        
        <SortableContext items={books.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div
            ref={setNodeRef}
            className={`min-h-[400px] space-y-3 p-4 rounded-lg border-2 border-dashed transition-all duration-300 ${
              isOver
                ? "border-secondary bg-secondary/10 shadow-glow-secondary"
                : "border-border/30 bg-background/20"
            }`}
          >
            {books.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground text-center">
                <p className="text-sm">Drag books here ✨</p>
              </div>
            ) : (
              books.map((book) => (
                <SortableBookCard key={book.id} book={book} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
