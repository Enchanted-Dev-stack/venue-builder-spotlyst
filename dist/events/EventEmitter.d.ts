export declare class EventEmitter<T extends Record<string, any>> {
    private listeners;
    constructor();
    on<K extends keyof T>(event: K, callback: (data: T[K]) => void): () => void;
    off<K extends keyof T>(event: K, callback: (data: T[K]) => void): void;
    emit<K extends keyof T>(event: K, data: T[K]): void;
    removeAllListeners(): void;
}
