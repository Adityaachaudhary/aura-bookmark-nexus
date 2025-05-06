
import { useState } from "react";
import { Bookmark } from "@/contexts/BookmarkContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => Promise<void>;
  onViewSummary: (id: string, title: string, summary: string) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onDelete, onViewSummary, onReorder }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onReorder(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < bookmarks.length - 1) {
      onReorder(index, index + 1);
    }
  };

  return (
    <div className="w-full space-y-3">
      {bookmarks.map((bookmark, index) => (
        <div
          key={bookmark.id}
          className="p-4 border rounded-lg bg-card hover:border-primary/30 transition-all bookmark-card relative group"
        >
          <div 
            className="absolute top-4 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {index > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-1 rounded bg-background/80"
                onClick={() => handleMoveUp(index)}
                aria-label="Move up"
              >
                <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {index < bookmarks.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-1 rounded bg-background/80"
                onClick={() => handleMoveDown(index)}
                aria-label="Move down"
              >
                <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
          
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
          <p 
            className="text-sm mt-2 text-muted-foreground line-clamp-2 cursor-pointer hover:text-foreground transition-colors"
            onClick={() => onViewSummary(bookmark.id, bookmark.title, bookmark.summary)}
          >
            {bookmark.summary}
          </p>
          
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {bookmark.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BookmarkList;
