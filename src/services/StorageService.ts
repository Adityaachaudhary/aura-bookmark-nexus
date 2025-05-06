
// Simple wrapper for localStorage/IndexedDB for data persistence
export class StorageService {
  // IndexedDB implementation
  private db: IDBDatabase | null = null;
  private DB_NAME = 'bookmark_nexus';
  private DB_VERSION = 1;

  constructor() {
    this.initializeDB();
  }

  private initializeDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      // If already initialized, return the existing database
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
          // Create indexes for faster queries
          bookmarkStore.createIndex('userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
        // Fall back to localStorage if IndexedDB fails
        reject(new Error('Failed to open IndexedDB'));
      };
    }).catch(error => {
      console.error('Using localStorage fallback due to:', error);
      return null;
    });
  }

  async get(key: string): Promise<any> {
    try {
      const db = await this.initializeDB();
      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(key, 'readonly');
          const store = transaction.objectStore(key);
          const request = store.getAll();

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      } else {
        // Fallback to localStorage
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch (error) {
      console.error('Storage get error:', error);
      // Fallback to localStorage
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const db = await this.initializeDB();
      if (db && Array.isArray(value)) {
        const transaction = db.transaction(key, 'readwrite');
        const store = transaction.objectStore(key);
        
        // Clear existing data
        const clearRequest = store.clear();
        
        return new Promise((resolve, reject) => {
          clearRequest.onsuccess = () => {
            // Add each item individually
            let completed = 0;
            
            value.forEach((item) => {
              const addRequest = store.add(item);
              
              addRequest.onsuccess = () => {
                completed++;
                if (completed === value.length) {
                  resolve();
                }
              };
              
              addRequest.onerror = () => {
                reject(addRequest.error);
              };
            });
            
            if (value.length === 0) {
              resolve();
            }
          };
          
          clearRequest.onerror = () => {
            reject(clearRequest.error);
          };
        });
      } else {
        // Fallback to localStorage
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Storage set error:', error);
      // Fallback to localStorage
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const db = await this.initializeDB();
      if (db) {
        const transaction = db.transaction(key, 'readwrite');
        const store = transaction.objectStore(key);
        
        return new Promise((resolve, reject) => {
          const request = store.clear();
          
          request.onsuccess = () => {
            resolve();
          };
          
          request.onerror = () => {
            reject(request.error);
          };
        });
      } else {
        // Fallback to localStorage
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage delete error:', error);
      // Fallback to localStorage
      localStorage.removeItem(key);
    }
  }

  // Special methods for bookmarks
  async getBookmarksByUser(userId: string): Promise<any[]> {
    try {
      const db = await this.initializeDB();
      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('bookmarks', 'readonly');
          const store = transaction.objectStore('bookmarks');
          const index = store.index('userId');
          const request = index.getAll(userId);

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      } else {
        // Fallback to localStorage
        const bookmarks = localStorage.getItem('bookmarks');
        const parsedBookmarks = bookmarks ? JSON.parse(bookmarks) : [];
        return parsedBookmarks.filter((bookmark: any) => bookmark.userId === userId);
      }
    } catch (error) {
      console.error('GetBookmarksByUser error:', error);
      // Fallback to localStorage
      const bookmarks = localStorage.getItem('bookmarks');
      const parsedBookmarks = bookmarks ? JSON.parse(bookmarks) : [];
      return parsedBookmarks.filter((bookmark: any) => bookmark.userId === userId);
    }
  }

  async addBookmark(bookmark: any): Promise<void> {
    try {
      const db = await this.initializeDB();
      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('bookmarks', 'readwrite');
          const store = transaction.objectStore('bookmarks');
          const request = store.add(bookmark);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      } else {
        // Fallback to localStorage
        const bookmarks = localStorage.getItem('bookmarks');
        const parsedBookmarks = bookmarks ? JSON.parse(bookmarks) : [];
        parsedBookmarks.push(bookmark);
        localStorage.setItem('bookmarks', JSON.stringify(parsedBookmarks));
      }
    } catch (error) {
      console.error('AddBookmark error:', error);
      // Fallback to localStorage
      const bookmarks = localStorage.getItem('bookmarks');
      const parsedBookmarks = bookmarks ? JSON.parse(bookmarks) : [];
      parsedBookmarks.push(bookmark);
      localStorage.setItem('bookmarks', JSON.stringify(parsedBookmarks));
    }
  }

  async deleteBookmark(id: string): Promise<void> {
    try {
      const db = await this.initializeDB();
      if (db) {
        return new Promise((resolve, reject) => {
          const transaction = db.transaction('bookmarks', 'readwrite');
          const store = transaction.objectStore('bookmarks');
          const request = store.delete(id);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            reject(request.error);
          };
        });
      } else {
        // Fallback to localStorage
        const bookmarks = localStorage.getItem('bookmarks');
        if (bookmarks) {
          const parsedBookmarks = JSON.parse(bookmarks);
          const updatedBookmarks = parsedBookmarks.filter((bookmark: any) => bookmark.id !== id);
          localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
        }
      }
    } catch (error) {
      console.error('DeleteBookmark error:', error);
      // Fallback to localStorage
      const bookmarks = localStorage.getItem('bookmarks');
      if (bookmarks) {
        const parsedBookmarks = JSON.parse(bookmarks);
        const updatedBookmarks = parsedBookmarks.filter((bookmark: any) => bookmark.id !== id);
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      }
    }
  }
}
