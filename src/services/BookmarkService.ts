
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './StorageService';
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

export class BookmarkService {
  private storage: StorageService;
  private BOOKMARKS_KEY = 'bookmarks';

  constructor() {
    this.storage = new StorageService();
  }

  async getBookmarks(userId: string): Promise<Bookmark[]> {
    try {
      // Try to get from IndexedDB first
      const bookmarks = await this.storage.getBookmarksByUser(userId);
      return bookmarks;
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  }

  async addBookmark(url: string, userId: string, tags?: string[]): Promise<Bookmark> {
    try {
      // Extract metadata and generate summary
      const metaData = await this.extractMetadata(url);
      
      // Generate AI summary using Jina AI
      const summary = await this.generateSummary(url);
      
      // Get current bookmarks to determine order
      const currentBookmarks = await this.getBookmarks(userId);
      const maxOrder = currentBookmarks.length > 0 
        ? Math.max(...currentBookmarks.map(b => b.order !== undefined ? b.order : -1)) 
        : -1;
      
      const bookmark: Bookmark = {
        id: uuidv4(),
        url,
        title: metaData.title || 'Untitled Bookmark',
        favicon: metaData.favicon || this.generateDefaultFavicon(url),
        summary: summary || metaData.summary || 'No summary available.',
        userId,
        createdAt: Date.now(),
        tags: tags || [],
        order: maxOrder + 1 // Set order to be after all existing bookmarks
      };

      await this.storage.addBookmark(bookmark);
      return bookmark;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast.error('Failed to add bookmark');
      throw error;
    }
  }

  async deleteBookmark(id: string): Promise<void> {
    try {
      await this.storage.deleteBookmark(id);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  }
  
  async updateBookmarksOrder(bookmarks: Bookmark[]): Promise<void> {
    try {
      // Update each bookmark in storage
      for (const bookmark of bookmarks) {
        await this.storage.updateBookmark(bookmark);
      }
    } catch (error) {
      console.error('Error updating bookmark order:', error);
      throw error;
    }
  }

  private async generateSummary(url: string): Promise<string> {
    try {
      // Properly format the URL for Jina AI - keep the full URL with http/https
      // The example in the docs suggests using http:// after r.jina.ai/ but we need to ensure
      // the target URL includes its own protocol
      const encodedUrl = encodeURIComponent(url);
      
      // Make sure we're using the correct endpoint format
      // The API endpoint should be: https://r.jina.ai/http://encoded-url
      const apiUrl = `https://r.jina.ai/${encodedUrl}`;
      
      console.log('Calling Jina AI API with URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain'
        },
      });
      
      if (!response.ok) {
        console.error('Jina AI API response not OK:', response.status, response.statusText);
        throw new Error(`Failed to generate summary: ${response.statusText}`);
      }
      
      // Get the summary text
      const summaryText = await response.text();
      console.log('Received summary from Jina AI:', summaryText.substring(0, 100) + '...');
      
      // Trim the summary if it's too long
      const maxLength = 500;
      return summaryText.length > maxLength 
        ? summaryText.substring(0, maxLength) + '...'
        : summaryText;
    } catch (error) {
      console.error('Error generating summary with Jina AI:', error);
      return 'Summary temporarily unavailable.';
    }
  }

  private async extractMetadata(url: string): Promise<{ title: string; favicon: string; summary: string }> {
    try {
      // In a real app, this would be a backend API call
      // Due to CORS issues, we're simulating the API here
      
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 500));

      // Extract domain for defaults
      const domain = new URL(url).hostname;
      
      // Check if it's a common website to provide realistic demo data
      if (domain.includes('github.com')) {
        return {
          title: 'GitHub Repository',
          favicon: 'https://github.githubassets.com/favicons/favicon.svg',
          summary: 'A GitHub repository containing source code and documentation for a software project. GitHub provides hosting for software development and version control using Git.'
        };
      } else if (domain.includes('stackoverflow.com')) {
        return {
          title: 'Stack Overflow Question',
          favicon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico',
          summary: 'A programming question on Stack Overflow, the largest, most trusted online community for developers to learn and share knowledge.'
        };
      } else if (domain.includes('medium.com')) {
        return {
          title: 'Medium Article',
          favicon: 'https://miro.medium.com/v2/1*m-R_BkNf1Qjr1YbyOIJY2w.png',
          summary: 'An article on Medium, a platform where experts share their knowledge and ideas on various topics including technology, business, and personal development.'
        };
      } else if (domain.includes('youtube.com')) {
        return {
          title: 'YouTube Video',
          favicon: 'https://www.youtube.com/s/desktop/12d6b690/img/favicon_32x32.png',
          summary: 'A video on YouTube, the world\'s largest video sharing platform where creators upload content on various topics.'
        };
      } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
        return {
          title: 'Twitter Post',
          favicon: 'https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc727a.png',
          summary: 'A post on Twitter/X, a social networking platform where users post and interact with short messages.'
        };
      }
      
      // Generic metadata for demo purposes
      return {
        title: `Content from ${domain}`,
        favicon: this.generateDefaultFavicon(url),
        summary: `This is a webpage from ${domain}. The summary would typically be generated using an AI service like Jina AI in a production environment.`
      };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {
        title: 'Unknown Page',
        favicon: '',
        summary: 'Could not generate summary.'
      };
    }
  }

  private generateDefaultFavicon(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}`;
    } catch {
      return '/placeholder.svg';
    }
  }
}
