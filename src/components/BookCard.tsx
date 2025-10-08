import { Book } from "@/types/book";
import { Sparkles } from "lucide-react";

interface BookCardProps {
  book: Book;
  isDragging?: boolean;
}

export const BookCard = ({ book, isDragging }: BookCardProps) => {
  return (
    <div
      className={`group relative bg-card border-2 border-primary/30 rounded-lg p-4 cursor-grab active:cursor-grabbing transition-all duration-300 ${
        isDragging ? "opacity-50 rotate-3 scale-95" : "hover:scale-105 hover:shadow-glow-primary"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-holographic opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <Sparkles className="w-4 h-4 text-secondary animate-glow" />
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
        
        {book.genre && (
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full border border-primary/30">
            {book.genre}
          </span>
        )}
      </div>
    </div>
  );
};
