import React, { createContext, useState, useEffect, useContext } from 'react';
import { BookmarkService } from '../services/BookmarkService';
import { useAuth } from './AuthContext';
import { toast } from "sonner";

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon: string;
  summary: string;
  userId: string;
  createdAt: number;
  tags?: string[];
  order?: number;
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  loading: boolean;
  addBookmark: (url: string, tags?: string[]) => Promise<Bookmark>;
  deleteBookmark: (id: string) => Promise<void>;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  reorderBookmarks: (sourceIndex: number, destinationIndex: number) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user } = useAuth();
  const bookmarkService = new BookmarkService();

  useEffect(() => {
    const loadBookmarks = async () => {
      if (user) {
        setLoading(true);
        try {
          const userBookmarks = await bookmarkService.getBookmarks(user.id);
          // Sort by order property if it exists, otherwise by createdAt (newest first)
          const sortedBookmarks = userBookmarks.sort((a, b) => {
            // If both have order property, use it
            if (a.order !== undefined && b.order !== undefined) {
              return a.order - b.order;
            }
            // Otherwise sort by creation date (newest first)
            return b.createdAt - a.createdAt;
          });
          setBookmarks(sortedBookmarks);
        } catch (error) {
          console.error('Error loading bookmarks:', error);
          toast.error("Failed to load bookmarks");
        } finally {
          setLoading(false);
        }
      } else {
        setBookmarks([]);
      }
    };

    loadBookmarks();
  }, [user]);

  const addBookmark = async (url: string, tags?: string[]): Promise<Bookmark> => {
    if (!user) throw new Error("User not authenticated");
    
    setLoading(true);
    try {
      const newBookmark = await bookmarkService.addBookmark(url, user.id, tags);
      setBookmarks(prev => [newBookmark, ...prev]);
      return newBookmark;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (id: string) => {
    setLoading(true);
    try {
      await bookmarkService.deleteBookmark(id);
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
      toast.success("Bookmark deleted successfully!");
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      toast.error("Failed to delete bookmark");
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const reorderBookmarks = async (sourceIndex: number, destinationIndex: number) => {
    try {
      // Create a new array with the reordered bookmarks
      const reorderedBookmarks = [...bookmarks];
      const [movedBookmark] = reorderedBookmarks.splice(sourceIndex, 1);
      reorderedBookmarks.splice(destinationIndex, 0, movedBookmark);
      
      // Update the order property
      const updatedBookmarks = reorderedBookmarks.map((bookmark, index) => ({
        ...bookmark,
        order: index
      }));
      
      setBookmarks(updatedBookmarks);
      
      // Persist the new order
      await bookmarkService.updateBookmarksOrder(updatedBookmarks);
    } catch (error) {
      console.error('Error reordering bookmarks:', error);
      toast.error("Failed to update bookmark order");
    }
  };

  const value = {
    bookmarks,
    loading,
    addBookmark,
    deleteBookmark,
    viewMode,
    setViewMode,
    reorderBookmarks
  };

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
};

export const useBookmarks = (): BookmarkContextType => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
