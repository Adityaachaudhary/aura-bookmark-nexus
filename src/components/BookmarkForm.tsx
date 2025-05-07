
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, useBookmarks } from "@/contexts/BookmarkContext";
import { BookmarkPlusIcon, TagIcon } from "lucide-react";
import { toast } from "sonner";

interface BookmarkFormProps {
  onSuccess?: (bookmark: Bookmark) => void;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({ onSuccess }) => {
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addBookmark } = useBookmarks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    let formattedUrl = url.trim();
    
    // Add protocol if missing
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    // Validate URL
    try {
      new URL(formattedUrl); // Will throw error if invalid URL
    } catch (error) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    // Process tags - now required
    const tagArray = tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
      
    // Validate that tags are present
    if (tagArray.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }
    
    setIsSubmitting(true);
    toast.info("Generating summary with AI... This may take a moment.");
    
    try {
      const bookmark = await addBookmark(formattedUrl, tagArray);
      setUrl("");
      setTags("");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-2">
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
      </div>
      
      {/* Always show tag input - no longer toggleable */}
      <div className="flex items-center gap-2 mt-2">
        <TagIcon className="h-4 w-4" />
        <span className="text-sm">Tags (required)</span>
      </div>
      
      <Input
        type="text"
        placeholder="Enter tags separated by commas (e.g., work, research, reading)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        disabled={isSubmitting}
        required
      />
    </form>
  );
};

export default BookmarkForm;
