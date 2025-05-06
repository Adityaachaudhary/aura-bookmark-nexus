
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
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  loading: boolean;
  addBookmark: (url: string, tags?: string[]) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
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
          setBookmarks(userBookmarks);
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

  const addBookmark = async (url: string, tags?: string[]) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newBookmark = await bookmarkService.addBookmark(url, user.id, tags);
      setBookmarks(prev => [newBookmark, ...prev]);
      toast.success("Bookmark added successfully!");
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast.error("Failed to add bookmark");
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

  const value = {
    bookmarks,
    loading,
    addBookmark,
    deleteBookmark,
    viewMode,
    setViewMode
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
