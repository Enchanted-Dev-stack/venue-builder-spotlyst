import { BaseTool, ToolContext } from './BaseTool';
import { Point } from '../core/types';
import { ResizeHandle } from '../core/SelectionManager';
import { snapToGrid } from '../utils/math';
import { ELEMENT_MIN_SIZE } from '../utils/constants';

export class SelectTool extends BaseTool {
  private isDragging: boolean = false;
  private isResizing: boolean = false;
  private hasMoved: boolean = false;
  private dragStartWorld: Point | null = null;
  private dragOriginalPositions: Map<string, { x: number; y: number }> = new Map();
  private activeHandle: ResizeHandle = null;
  private resizeElementId: string | null = null;
  private resizeStartBounds: { x: number; y: number; width: number; height: number } | null = null;

  constructor(context: ToolContext) {
    super(context);
  }

  onMouseDown(worldPos: Point, e: MouseEvent): void {
    const { elementManager, selectionManager, groupManager } = this.ctx;

    // Check if clicking on a resize handle first
    const handleHit = selectionManager.hitTestHandles(
      worldPos.x,
      worldPos.y,
      elementManager.getAll(),
    );

    if (handleHit) {
      this.isResizing = true;
      this.hasMoved = false;
      this.activeHandle = handleHit.handle;
      this.resizeElementId = handleHit.elementId;
      const el = elementManager.get(handleHit.elementId);
      if (el) {
        this.resizeStartBounds = { ...el.getBounds() };
      }
      this.dragStartWorld = { ...worldPos };
      return;
    }

    // Hit test elements
    const hit = elementManager.hitTest(worldPos.x, worldPos.y);

    if (hit) {
      // If the element is in a group, select all group members
      const group = hit.groupId ? groupManager.getGroup(hit.groupId) : undefined;

      if (e.shiftKey) {
        if (selectionManager.isSelected(hit.id)) {
          selectionManager.deselect(hit.id);
        } else {
          selectionManager.addToSelection(hit);
          // If in a group, add all group members
          if (group) {
            const members = groupManager.getGroupElements(group.id, elementManager.getAll());
            for (const m of members) {
              selectionManager.addToSelection(m);
            }
          }
        }
      } else {
        if (!selectionManager.isSelected(hit.id)) {
          selectionManager.clearSelection();
          selectionManager.select(hit);
          // If in a group, select all group members
          if (group) {
            const members = groupManager.getGroupElements(group.id, elementManager.getAll());
            for (const m of members) {
              selectionManager.addToSelection(m);
            }
          }
        }
      }

      // Start dragging — store original positions of all selected elements
      this.isDragging = true;
      this.hasMoved = false;
      this.dragStartWorld = { ...worldPos };
      this.dragOriginalPositions.clear();
      const selectedIds = selectionManager.getSelectedIds();
      for (const id of selectedIds) {
        const el = elementManager.get(id);
        if (el) {
          this.dragOriginalPositions.set(id, { x: el.x, y: el.y });
        }
      }
    } else {
      // Clicked on empty space - clear selection
      if (!e.shiftKey) {
        selectionManager.clearSelection();
      }
    }
  }

  onMouseMove(worldPos: Point, _e: MouseEvent): void {
    const { elementManager, selectionManager } = this.ctx;

    if (this.isResizing && this.dragStartWorld && this.resizeElementId && this.resizeStartBounds) {
      const el = elementManager.get(this.resizeElementId);
      if (!el) return;

      this.hasMoved = true;
      const dx = worldPos.x - this.dragStartWorld.x;
      const dy = worldPos.y - this.dragStartWorld.y;
      const b = this.resizeStartBounds;

      let newX = b.x;
      let newY = b.y;
      let newW = b.width;
      let newH = b.height;

      switch (this.activeHandle) {
        case 'se':
          newW = b.width + dx;
          newH = b.height + dy;
          break;
        case 'sw':
          newX = b.x + dx;
          newW = b.width - dx;
          newH = b.height + dy;
          break;
        case 'ne':
          newY = b.y + dy;
          newW = b.width + dx;
          newH = b.height - dy;
          break;
        case 'nw':
          newX = b.x + dx;
          newY = b.y + dy;
          newW = b.width - dx;
          newH = b.height - dy;
          break;
      }

      if (this.ctx.snapToGrid) {
        const effectiveGrid = this.getEffectiveGridSize();
        newX = snapToGrid(newX, effectiveGrid);
        newY = snapToGrid(newY, effectiveGrid);
        newW = snapToGrid(newW, effectiveGrid);
        newH = snapToGrid(newH, effectiveGrid);
      }

      newW = Math.max(ELEMENT_MIN_SIZE, newW);
      newH = Math.max(ELEMENT_MIN_SIZE, newH);

      el.moveTo(newX, newY);
      el.resize(newW, newH);
      return;
    }

    if (this.isDragging && this.dragStartWorld) {
      this.hasMoved = true;
      const dx = worldPos.x - this.dragStartWorld.x;
      const dy = worldPos.y - this.dragStartWorld.y;

      // Use original positions + total delta to avoid snap drift
      const effectiveGrid = this.ctx.snapToGrid ? this.getEffectiveGridSize() : 0;
      for (const [id, origPos] of this.dragOriginalPositions) {
        const el = elementManager.get(id);
        if (el) {
          let newX = origPos.x + dx;
          let newY = origPos.y + dy;
          if (effectiveGrid > 0) {
            newX = snapToGrid(newX, effectiveGrid);
            newY = snapToGrid(newY, effectiveGrid);
          }
          el.moveTo(newX, newY);
        }
      }
      return;
    }

    // Hover detection
    const hit = elementManager.hitTest(worldPos.x, worldPos.y);
    selectionManager.setHovered(hit ? hit.id : null);
  }

  onMouseUp(_worldPos: Point, _e: MouseEvent): void {
    const stateChanged = this.hasMoved && (this.isDragging || this.isResizing);

    this.isDragging = false;
    this.isResizing = false;
    this.hasMoved = false;
    this.dragStartWorld = null;
    this.dragOriginalPositions.clear();
    this.activeHandle = null;
    this.resizeElementId = null;
    this.resizeStartBounds = null;

    if (stateChanged) {
      this.ctx.onStateChanged();
    }
  }

  onKeyDown(e: KeyboardEvent): void {
    const { selectionManager, elementManager } = this.ctx;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      const selectedIds = selectionManager.getSelectedIds();
      for (const id of selectedIds) {
        elementManager.remove(id);
        selectionManager.deselect(id);
      }
      if (selectedIds.length > 0) {
        this.ctx.onStateChanged();
      }
    }

    if (e.key === 'Escape') {
      selectionManager.clearSelection();
    }
  }

  getCursor(): string {
    if (this.isResizing) {
      switch (this.activeHandle) {
        case 'nw':
        case 'se':
          return 'nwse-resize';
        case 'ne':
        case 'sw':
          return 'nesw-resize';
      }
    }
    return this.isDragging ? 'grabbing' : 'default';
  }
}
