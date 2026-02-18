import { BaseElement } from '../elements/BaseElement';
import { Camera } from './Camera';
import { COLORS } from '../theme/colors';
import { HANDLE_SIZE } from '../utils/constants';

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;

/**
 * Tracks which canvas elements are currently selected and / or hovered, and
 * renders the selection chrome (dashed border + corner resize handles) on top
 * of the normal element rendering pass.
 */
export class SelectionManager {
  private selected: Set<string>;
  private hoveredId: string | null;

  constructor() {
    this.selected = new Set();
    this.hoveredId = null;
  }

  // ── Mutation ──────────────────────────────────────────────────────────────

  /** Replace the current selection with a single element. */
  select(element: BaseElement): void {
    this.selected.clear();
    this.selected.add(element.id);
  }

  /** Add an element to the current selection (shift-click multi-select). */
  addToSelection(element: BaseElement): void {
    this.selected.add(element.id);
  }

  /** Remove a single element from the selection. */
  deselect(id: string): void {
    this.selected.delete(id);
  }

  /** Clear the entire selection. */
  clearSelection(): void {
    this.selected.clear();
  }

  // ── Query ─────────────────────────────────────────────────────────────────

  isSelected(id: string): boolean {
    return this.selected.has(id);
  }

  getSelectedIds(): string[] {
    return Array.from(this.selected);
  }

  getSelectedCount(): number {
    return this.selected.size;
  }

  // ── Hover ─────────────────────────────────────────────────────────────────

  setHovered(id: string | null): void {
    this.hoveredId = id;
  }

  isHovered(id: string): boolean {
    return this.hoveredId === id;
  }

  // ── Drawing ───────────────────────────────────────────────────────────────

  /**
   * Draw selection indicators (dashed border + corner handles) for every
   * selected element that appears in the provided element list.
   *
   * Call this *after* all elements have been drawn so the chrome renders on
   * top.
   */
  drawSelection(ctx: CanvasRenderingContext2D, elements: BaseElement[]): void {
    for (const element of elements) {
      if (!this.selected.has(element.id)) continue;

      const bounds = element.getBounds();
      const { x, y, width, height } = bounds;

      const isHover = this.hoveredId === element.id;

      // --- Dashed border ---------------------------------------------------
      ctx.save();
      ctx.strokeStyle = isHover ? COLORS.selection.hover : COLORS.selection.border;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
      ctx.restore();

      // --- Corner handles --------------------------------------------------
      const half = HANDLE_SIZE / 2;
      const corners: { hx: number; hy: number }[] = [
        { hx: x - half, hy: y - half },                       // nw
        { hx: x + width - half, hy: y - half },               // ne
        { hx: x - half, hy: y + height - half },              // sw
        { hx: x + width - half, hy: y + height - half },      // se
      ];

      ctx.save();
      ctx.fillStyle = COLORS.selection.handleFill;
      ctx.strokeStyle = isHover ? COLORS.selection.hover : COLORS.selection.handleStroke;
      ctx.lineWidth = 1.5;

      for (const c of corners) {
        ctx.fillRect(c.hx, c.hy, HANDLE_SIZE, HANDLE_SIZE);
        ctx.strokeRect(c.hx, c.hy, HANDLE_SIZE, HANDLE_SIZE);
      }

      ctx.restore();
    }
  }

  // ── Handle hit-testing ────────────────────────────────────────────────────

  /**
   * Test whether the given world-space point hits one of the resize handles
   * of any selected element.
   *
   * @returns An object identifying the element and handle, or `null`.
   */
  hitTestHandles(
    worldX: number,
    worldY: number,
    elements: BaseElement[],
  ): { elementId: string; handle: ResizeHandle } | null {
    const half = HANDLE_SIZE / 2;

    // Iterate in reverse so the top-most selected element wins.
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (!this.selected.has(element.id)) continue;

      const { x, y, width, height } = element.getBounds();

      const handles: { handle: ResizeHandle; hx: number; hy: number }[] = [
        { handle: 'nw', hx: x, hy: y },
        { handle: 'ne', hx: x + width, hy: y },
        { handle: 'sw', hx: x, hy: y + height },
        { handle: 'se', hx: x + width, hy: y + height },
      ];

      for (const h of handles) {
        if (
          worldX >= h.hx - half &&
          worldX <= h.hx + half &&
          worldY >= h.hy - half &&
          worldY <= h.hy + half
        ) {
          return { elementId: element.id, handle: h.handle };
        }
      }
    }

    return null;
  }
}
