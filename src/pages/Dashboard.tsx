
import { useState } from "react";
import Header from "@/components/Header";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import BookmarkList from "@/components/BookmarkList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { GridIcon, ListIcon, TagsIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { bookmarks, loading, deleteBookmark, viewMode, setViewMode, reorderBookmarks } = useBookmarks();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [openSummary, setOpenSummary] = useState<{id: string, title: string, summary: string} | null>(null);
  
  // Extract unique tags from all bookmarks
  const allTags = [...new Set(bookmarks.flatMap(bookmark => bookmark.tags || []))].sort();
  
  // Filter bookmarks by selected tag
  const filteredBookmarks = selectedTag 
    ? bookmarks.filter(bookmark => bookmark.tags?.includes(selectedTag))
    : bookmarks;

  const handleDelete = async (id: string) => {
    try {
      await deleteBookmark(id);
    } catch (error) {
      toast.error("Failed to delete bookmark");
    }
  };
  
  const handleViewSummary = (id: string, title: string, summary: string) => {
    setOpenSummary({id, title, summary});
  };
  
  const handleReorder = (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    
    reorderBookmarks(sourceIndex, destinationIndex);
    toast.success("Bookmark order updated");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-8">Your Bookmarks</h1>
          <BookmarkForm />
        </div>
        
        {/* Tag filtering */}
        {allTags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <TagsIcon className="h-4 w-4" />
              <h3 className="text-sm font-medium">Filter by tag</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge 
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                  {selectedTag === tag && (
                    <XIcon className="h-3 w-3 ml-1" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTag(null);
                    }} />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'Bookmark' : 'Bookmarks'}
            {selectedTag && <span className="text-sm font-normal ml-2">(filtered by "{selectedTag}")</span>}
          </h2>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="w-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {selectedTag 
                ? `No bookmarks found with tag "${selectedTag}"`
                : "You don't have any bookmarks yet"
              }
            </p>
            {selectedTag ? (
              <Button variant="outline" onClick={() => setSelectedTag(null)}>
                Clear filter
              </Button>
            ) : (
              <p className="text-muted-foreground">Use the form above to add your first bookmark</p>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <BookmarkGrid 
            bookmarks={filteredBookmarks} 
            onDelete={handleDelete} 
            onViewSummary={handleViewSummary}
            onReorder={handleReorder}
          />
        ) : (
          <BookmarkList 
            bookmarks={filteredBookmarks} 
            onDelete={handleDelete}
            onViewSummary={handleViewSummary}
            onReorder={handleReorder}
          />
        )}
        
        {/* Summary Dialog */}
        <Dialog open={openSummary !== null} onOpenChange={() => setOpenSummary(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{openSummary?.title}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[50vh] mt-4">
              <div className="p-4 whitespace-pre-wrap text-sm">
                {openSummary?.summary}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Dashboard;
