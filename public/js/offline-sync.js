/**
 * Offline Synchronization Logic
 */

class OfflineSync {
  constructor() {
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Check for pending items on load
    if (this.isOnline) {
      this.syncPending();
    }
  }

  handleOnline() {
    this.isOnline = true;
    console.log('🌐 App is online. Starting sync...');
    showStatusToast('You are back online. Syncing progress...', 'success');
    this.syncPending();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('🚫 App is offline. Progress will be saved locally.');
    showStatusToast('Working offline. Progress saved locally.', 'info');
  }

  async syncPending() {
    try {
      const queue = await window.offlineStorage.getSyncQueue();
      if (queue.length === 0) return;

      console.log(`🔄 Syncing ${queue.length} pending items...`);

      for (const item of queue) {
        let success = false;
        try {
          if (item.type === 'TOPIC_COMPLETE') {
            const response = await fetch(`/topics/${item.data.topicId}/complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            success = response.ok;
          } else if (item.type === 'TIME_TRACK') {
            const response = await fetch(`/topics/${item.data.topicId}/time`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ timeSpent: item.data.timeSpent })
            });
            success = response.ok;
          }

          if (success) {
            await window.offlineStorage.removeFromSyncQueue(item.id);
          }
        } catch (err) {
          console.error('Failed to sync item:', item, err);
          break; // Stop if there's a network error during sync
        }
      }
      
      console.log('✨ Sync complete!');
    } catch (error) {
      console.error('Sync process error:', error);
    }
  }

  async performAction(type, data, fetchCall) {
    if (this.isOnline) {
      try {
        const response = await fetchCall();
        if (response.ok) return response;
        throw new Error('Network response was not ok');
      } catch (error) {
        console.warn('Network request failed, queueing for sync:', error);
      }
    }

    // If offline or request failed
    console.log('Saving to local sync queue:', type, data);
    await window.offlineStorage.addToSyncQueue(type, data);
    
    // For completion, we also save to local cache so UI can reflect it immediately
    if (type === 'TOPIC_COMPLETE') {
      const currentProgress = await window.offlineStorage.getLocalProgress(data.topicId) || { completed: false };
      await window.offlineStorage.saveProgressLocally(data.topicId, { 
        completed: !currentProgress.completed,
        topicId: data.topicId
      });
    }

    return { 
      json: async () => ({ 
        success: true, 
        offline: true, 
        completed: type === 'TOPIC_COMPLETE' ? (await window.offlineStorage.getLocalProgress(data.topicId)).completed : true 
      }),
      ok: true
    };
  }
}

// Global toast helper (if not already present)
function showStatusToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

const offlineSync = new OfflineSync();
window.offlineSync = offlineSync;
