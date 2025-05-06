
import { useState } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark } from "@/contexts/BookmarkContext";
import { ExternalLinkIcon, TrashIcon, MoveIcon } from "lucide-react";

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => Promise<void>;
  onViewSummary: (id: string, title: string, summary: string) => void;
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({ bookmarks, onDelete, onViewSummary }) => {
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
    <Droppable droppableId="bookmarks-grid" direction="horizontal">
      {(provided) => (
        <div 
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
        >
          {bookmarks.map((bookmark, index) => (
            <Draggable key={bookmark.id} draggableId={bookmark.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                >
                  <Card className="bookmark-card overflow-hidden flex flex-col h-full relative group">
                    <div 
                      {...provided.dragHandleProps} 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab p-1 rounded bg-background/80"
                    >
                      <MoveIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
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
                      <p 
                        className="text-muted-foreground text-sm line-clamp-4 cursor-pointer hover:text-foreground transition-colors"
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
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default BookmarkGrid;
