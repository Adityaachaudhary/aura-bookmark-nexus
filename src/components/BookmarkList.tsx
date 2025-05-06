
import { useState } from "react";
import { Bookmark } from "@/contexts/BookmarkContext";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, TrashIcon } from "lucide-react";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => Promise<void>;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full space-y-3">
      {bookmarks.map(bookmark => (
        <div 
          key={bookmark.id}
          className="p-4 border rounded-lg bg-card hover:border-primary/30 transition-all bookmark-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {bookmark.favicon && (
                <img 
                  src={bookmark.favicon} 
                  alt="Favicon"
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    // Use placeholder if favicon fails to load
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg truncate">{bookmark.title}</h3>
                <p className="text-muted-foreground text-sm truncate">{bookmark.url}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <a 
                href={bookmark.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:text-primary/80"
              >
                <ExternalLinkIcon className="h-5 w-5" />
              </a>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(bookmark.id)}
                disabled={deletingId === bookmark.id}
              >
                {deletingId === bookmark.id ? (
                  <div className="animate-spin h-5 w-5 border-2 border-destructive border-t-transparent rounded-full" />
                ) : (
                  <TrashIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
            {bookmark.summary}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BookmarkList;
