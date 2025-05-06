
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, useBookmarks } from "@/contexts/BookmarkContext";
import { BookmarkPlusIcon } from "lucide-react";
import { toast } from "sonner";

interface BookmarkFormProps {
  onSuccess?: (bookmark: Bookmark) => void;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({ onSuccess }) => {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addBookmark } = useBookmarks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    try {
      new URL(url); // Will throw error if invalid URL
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setIsSubmitting(true);
    toast.info("Generating summary with AI... This may take a moment.");
    
    try {
      const bookmark = await addBookmark(url);
      setUrl("");
      toast.success("Bookmark added with AI summary");
      if (onSuccess) onSuccess(bookmark);
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast.error("Failed to add bookmark");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-3xl">
      <Input
        type="text"
        placeholder="Enter URL to bookmark (e.g., https://example.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1"
        disabled={isSubmitting}
        required
      />
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="whitespace-nowrap"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Generating AI Summary...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <BookmarkPlusIcon className="h-4 w-4" />
            <span>Add Bookmark</span>
          </div>
        )}
      </Button>
    </form>
  );
};

export default BookmarkForm;
