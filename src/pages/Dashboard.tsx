
import { useState } from "react";
import Header from "@/components/Header";
import BookmarkForm from "@/components/BookmarkForm";
import BookmarkGrid from "@/components/BookmarkGrid";
import BookmarkList from "@/components/BookmarkList";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/contexts/BookmarkContext";
import { GridIcon, ListIcon } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { bookmarks, loading, deleteBookmark, viewMode, setViewMode } = useBookmarks();

  const handleDelete = async (id: string) => {
    try {
      await deleteBookmark(id);
    } catch (error) {
      toast.error("Failed to delete bookmark");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-8">Your Bookmarks</h1>
          <BookmarkForm />
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {bookmarks.length} {bookmarks.length === 1 ? 'Bookmark' : 'Bookmarks'}
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
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You don't have any bookmarks yet</p>
            <p className="text-muted-foreground">Use the form above to add your first bookmark</p>
          </div>
        ) : viewMode === 'grid' ? (
          <BookmarkGrid bookmarks={bookmarks} onDelete={handleDelete} />
        ) : (
          <BookmarkList bookmarks={bookmarks} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
