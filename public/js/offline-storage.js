/**
 * Offline Storage Utility using IndexedDB
 */

const DB_NAME = 'JAMBStudyHubOffline';
const DB_VERSION = 1;
const STORES = {
  PANY_SYNC: 'sync-queue',
  PROGRESS: 'progress-cache',
  SCORES: 'scores-cache'
};

class OfflineStorage {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Queue for actions to sync when back online
        if (!db.objectStoreNames.contains(STORES.PANY_SYNC)) {
          db.createObjectStore(STORES.PANY_SYNC, { keyPath: 'id', autoIncrement: true });
        }
        
        // Cache for user progress
        if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
          db.createObjectStore(STORES.PROGRESS, { keyPath: 'topicId' });
        }

        // Cache for exercise scores
        if (!db.objectStoreNames.contains(STORES.SCORES)) {
          db.createObjectStore(STORES.SCORES, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async addToSyncQueue(type, data) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PANY_SYNC], 'readwrite');
      const store = transaction.objectStore(STORES.PANY_SYNC);
      const request = store.add({
        type,
        data,
        timestamp: Date.now()
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PANY_SYNC], 'readonly');
      const store = transaction.objectStore(STORES.PANY_SYNC);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromSyncQueue(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PANY_SYNC], 'readwrite');
      const store = transaction.objectStore(STORES.PANY_SYNC);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveProgressLocally(topicId, data) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PROGRESS], 'readwrite');
      const store = transaction.objectStore(STORES.PROGRESS);
      const request = store.put({ topicId, ...data });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLocalProgress(topicId) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PROGRESS], 'readonly');
      const store = transaction.objectStore(STORES.PROGRESS);
      const request = store.get(topicId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

const offlineStorage = new OfflineStorage();
window.offlineStorage = offlineStorage;
