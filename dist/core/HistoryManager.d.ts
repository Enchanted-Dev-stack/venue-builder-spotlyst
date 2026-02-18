import { ElementData, GroupData } from './types';
interface HistoryState {
    elements: ElementData[];
    groups: GroupData[];
}
/**
 * Simple linear undo / redo manager that stores deep-cloned snapshots of the
 * entire canvas state (elements + groups).
 *
 * Usage:
 * 1. Call `push(state)` after every user action that should be undoable.
 * 2. Call `undo()` / `redo()` to step through the history.
 *
 * The redo stack is cleared whenever a new state is pushed (standard behaviour
 * – redo is only available immediately after undo with no intervening edits).
 */
export declare class HistoryManager {
    private undoStack;
    private redoStack;
    private maxHistory;
    constructor(maxHistory?: number);
    /**
     * Record a new state snapshot.  Any pending redo states are discarded.
     */
    push(state: HistoryState): void;
    /**
     * Step backward.  The current (most-recent) state is moved to the redo
     * stack and the previous state is returned so the caller can restore it.
     *
     * Returns `null` if there is nothing to undo (≤ 1 entry on the stack –
     * we need at least one entry to remain as the "current" state).
     */
    undo(): HistoryState | null;
    /**
     * Step forward.  The next redo state is moved back onto the undo stack and
     * returned.
     *
     * Returns `null` if there is nothing to redo.
     */
    redo(): HistoryState | null;
    canUndo(): boolean;
    canRedo(): boolean;
    /** Discard all history. */
    clear(): void;
    /** Produce a deep clone of a history state using structured-clone-safe JSON round-trip. */
    private clone;
}
export {};
