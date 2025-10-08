export interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  status: "toRead" | "completed";
}
