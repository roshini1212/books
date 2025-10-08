import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from "@dnd-kit/core";
import { BookSection } from "@/components/BookSection";
import { BookCard } from "@/components/BookCard";
import { Book } from "@/types/book";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

const Index = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) throw error;
      
      const formattedBooks: Book[] = data.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        genre: book.genre || undefined,
        status: book.status as "toRead" | "completed",
      }));
      
      setBooks(formattedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const book = books.find((b) => b.id === event.active.id);
    if (book) {
      setActiveBook(book);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveBook(null);
    const { active, over } = event;

    if (!over || !user) return;

    const activeBook = books.find((b) => b.id === active.id);
    if (!activeBook) return;

    const overId = over.id.toString();
    if (overId === "toRead" || overId === "completed") {
      const newStatus: "toRead" | "completed" = overId;

      if (activeBook.status !== newStatus) {
        try {
          const { error } = await supabase
            .from("books")
            .update({
              status: newStatus,
              completed_at: newStatus === "completed" ? new Date().toISOString() : null,
            })
            .eq("id", activeBook.id);

          if (error) throw error;

          setBooks((prevBooks) =>
            prevBooks.map((book) =>
              book.id === activeBook.id ? { ...book, status: newStatus } : book
            )
          );

          // Update stats
          await updateReadingStats();

          toast.success(
            `Moved "${activeBook.title}" to ${
              newStatus === "toRead" ? "To Read" : "Completed"
            }! ✨`,
            {
              duration: 2000,
            }
          );
        } catch (error) {
          console.error("Error updating book:", error);
          toast.error("Failed to update book");
        }
      }
    }
  };

  const updateReadingStats = async () => {
    if (!user) return;

    const toReadCount = books.filter((b) => b.status === "toRead").length;
    const completedCount = books.filter((b) => b.status === "completed").length;

    await supabase
      .from("reading_stats")
      .update({
        total_books_to_read: toReadCount,
        total_books_read: completedCount,
      })
      .eq("user_id", user.id);
  };

  const toReadBooks = books.filter((book) => book.status === "toRead");
  const completedBooks = books.filter((book) => book.status === "completed");

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your bookshelf...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-40 right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-36 h-36 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <h1
            className="text-6xl md:text-7xl font-black mb-4 bg-gradient-holographic bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Y2K BOOKSHELF
          </h1>
          <p
            className="text-lg text-muted-foreground"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Drag & drop your books between sections ✨
          </p>
        </header>

        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            <BookSection
              title="To Read"
              books={toReadBooks}
              droppableId="toRead"
              icon="reading"
            />
            <BookSection
              title="Completed"
              books={completedBooks}
              droppableId="completed"
              icon="completed"
            />
          </div>

          <DragOverlay>
            {activeBook ? <BookCard book={activeBook} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Index;
