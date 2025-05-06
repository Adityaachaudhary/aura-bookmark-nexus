
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark } from "@/contexts/BookmarkContext";
import { ExternalLinkIcon, TrashIcon } from "lucide-react";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => Promise<void>;
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({ bookmarks, onDelete }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {bookmarks.map(bookmark => (
        <Card key={bookmark.id} className="bookmark-card overflow-hidden flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {bookmark.favicon && (
                <img 
                  src={bookmark.favicon} 
                  alt="Favicon"
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    // Use placeholder if favicon fails to load
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              )}
              <h3 className="font-medium text-lg truncate flex-1">{bookmark.title}</h3>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1">
            <p className="text-muted-foreground text-sm line-clamp-4">
              {bookmark.summary}
            </p>
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2 border-t">
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLinkIcon className="h-3 w-3" />
              Visit
            </a>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-auto"
              onClick={() => handleDelete(bookmark.id)}
              disabled={deletingId === bookmark.id}
            >
              {deletingId === bookmark.id ? (
                <div className="animate-spin h-4 w-4 border-2 border-destructive border-t-transparent rounded-full" />
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default BookmarkGrid;
