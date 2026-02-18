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
export class HistoryManager {
  private undoStack: HistoryState[];
  private redoStack: HistoryState[];
  private maxHistory: number;

  constructor(maxHistory: number = 50) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = maxHistory;
  }

  /**
   * Record a new state snapshot.  Any pending redo states are discarded.
   */
  push(state: HistoryState): void {
    // Deep-clone so that later mutations don't corrupt history.
    this.undoStack.push(this.clone(state));
    this.redoStack = [];

    // Evict the oldest entry if we exceed the budget.
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
  }

  /**
   * Step backward.  The current (most-recent) state is moved to the redo
   * stack and the previous state is returned so the caller can restore it.
   *
   * Returns `null` if there is nothing to undo (≤ 1 entry on the stack –
   * we need at least one entry to remain as the "current" state).
   */
  undo(): HistoryState | null {
    if (this.undoStack.length <= 1) return null;

    const current = this.undoStack.pop()!;
    this.redoStack.push(current);

    // Return a clone of the now-current tip.
    return this.clone(this.undoStack[this.undoStack.length - 1]);
  }

  /**
   * Step forward.  The next redo state is moved back onto the undo stack and
   * returned.
   *
   * Returns `null` if there is nothing to redo.
   */
  redo(): HistoryState | null {
    if (this.redoStack.length === 0) return null;

    const state = this.redoStack.pop()!;
    this.undoStack.push(state);

    return this.clone(state);
  }

  canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Discard all history. */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  /** Produce a deep clone of a history state using structured-clone-safe JSON round-trip. */
  private clone(state: HistoryState): HistoryState {
    return JSON.parse(JSON.stringify(state));
  }
}
