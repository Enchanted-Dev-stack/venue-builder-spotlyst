export class EventEmitter<T extends Record<string, any>> {
  private listeners: Map<keyof T, Set<Function>>;

  constructor() {
    this.listeners = new Map();
  }

  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return an unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  off<K extends keyof T>(event: K, callback: (data: T[K]) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        callback(data);
      });
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}
