import { BaseElement } from '../elements/BaseElement';
export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;
/**
 * Tracks which canvas elements are currently selected and / or hovered, and
 * renders the selection chrome (dashed border + corner resize handles) on top
 * of the normal element rendering pass.
 */
export declare class SelectionManager {
    private selected;
    private hoveredId;
    constructor();
    /** Replace the current selection with a single element. */
    select(element: BaseElement): void;
    /** Add an element to the current selection (shift-click multi-select). */
    addToSelection(element: BaseElement): void;
    /** Remove a single element from the selection. */
    deselect(id: string): void;
    /** Clear the entire selection. */
    clearSelection(): void;
    isSelected(id: string): boolean;
    getSelectedIds(): string[];
    getSelectedCount(): number;
    setHovered(id: string | null): void;
    isHovered(id: string): boolean;
    /**
     * Draw selection indicators (dashed border + corner handles) for every
     * selected element that appears in the provided element list.
     *
     * Call this *after* all elements have been drawn so the chrome renders on
     * top.
     */
    drawSelection(ctx: CanvasRenderingContext2D, elements: BaseElement[]): void;
    /**
     * Test whether the given world-space point hits one of the resize handles
     * of any selected element.
     *
     * @returns An object identifying the element and handle, or `null`.
     */
    hitTestHandles(worldX: number, worldY: number, elements: BaseElement[]): {
        elementId: string;
        handle: ResizeHandle;
    } | null;
}
