import { Camera } from './Camera';
import { BaseTool } from '../tools/BaseTool';
import { Point } from './types';

/**
 * Handles all mouse and keyboard events on the canvas, converting screen
 * coordinates to world coordinates and delegating to the active tool.
 *
 * Also manages canvas-level interactions like space+drag panning and
 * scroll-wheel zooming that are independent of the current tool.
 */
export class InteractionManager {
  private canvas: HTMLCanvasElement;
  private camera: Camera;
  private currentTool: BaseTool | null = null;
  private isPanning: boolean = false;
  private panStart: Point = { x: 0, y: 0 };
  private spacePressed: boolean = false;
  private onDirty: () => void;

  // Bound handler references so we can remove them later
  private boundHandleMouseDown: (e: MouseEvent) => void;
  private boundHandleMouseMove: (e: MouseEvent) => void;
  private boundHandleMouseUp: (e: MouseEvent) => void;
  private boundHandleWheel: (e: WheelEvent) => void;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleKeyUp: (e: KeyboardEvent) => void;
  private boundHandleContextMenu: (e: MouseEvent) => void;

  constructor(canvas: HTMLCanvasElement, camera: Camera, onDirty: () => void) {
    this.canvas = canvas;
    this.camera = camera;
    this.onDirty = onDirty;

    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);
    this.boundHandleWheel = this.handleWheel.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    this.boundHandleContextMenu = this.handleContextMenu.bind(this);
  }

  setTool(tool: BaseTool): void {
    if (this.currentTool) {
      this.currentTool.deactivate();
    }
    this.currentTool = tool;
    this.currentTool.activate();
    this.updateCursor();
    this.onDirty();
  }

  getTool(): BaseTool | null {
    return this.currentTool;
  }

  /** Binds all event listeners to the canvas and document. */
  bind(): void {
    this.canvas.addEventListener('mousedown', this.boundHandleMouseDown);
    this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
    this.canvas.addEventListener('mouseup', this.boundHandleMouseUp);
    this.canvas.addEventListener('wheel', this.boundHandleWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', this.boundHandleContextMenu);
    document.addEventListener('keydown', this.boundHandleKeyDown);
    document.addEventListener('keyup', this.boundHandleKeyUp);
  }

  /** Removes all event listeners. */
  unbind(): void {
    this.canvas.removeEventListener('mousedown', this.boundHandleMouseDown);
    this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
    this.canvas.removeEventListener('mouseup', this.boundHandleMouseUp);
    this.canvas.removeEventListener('wheel', this.boundHandleWheel);
    this.canvas.removeEventListener('contextmenu', this.boundHandleContextMenu);
    document.removeEventListener('keydown', this.boundHandleKeyDown);
    document.removeEventListener('keyup', this.boundHandleKeyUp);
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private getCanvasOffset(e: MouseEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private screenToWorld(screenPos: Point): Point {
    return this.camera.screenToWorld(screenPos.x, screenPos.y);
  }

  private updateCursor(): void {
    if (this.spacePressed || this.isPanning) {
      this.canvas.style.cursor = this.isPanning ? 'grabbing' : 'grab';
      return;
    }
    if (this.currentTool) {
      this.canvas.style.cursor = this.currentTool.getCursor();
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  // ── Event handlers ───────────────────────────────────────────────────────

  private handleMouseDown(e: MouseEvent): void {
    const screenPos = this.getCanvasOffset(e);

    // Middle mouse button or space+left click starts panning
    if (e.button === 1 || (this.spacePressed && e.button === 0)) {
      this.isPanning = true;
      this.panStart = { x: e.clientX, y: e.clientY };
      this.updateCursor();
      e.preventDefault();
      return;
    }

    // Delegate to current tool
    if (this.currentTool && e.button === 0) {
      const worldPos = this.screenToWorld(screenPos);
      this.currentTool.onMouseDown(worldPos, e);
      this.updateCursor();
      this.onDirty();
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    const screenPos = this.getCanvasOffset(e);

    if (this.isPanning) {
      const dx = e.clientX - this.panStart.x;
      const dy = e.clientY - this.panStart.y;
      this.camera.panBy(dx, dy);
      this.panStart = { x: e.clientX, y: e.clientY };
      this.updateCursor();
      this.onDirty();
      return;
    }

    // Delegate to current tool
    if (this.currentTool) {
      const worldPos = this.screenToWorld(screenPos);
      this.currentTool.onMouseMove(worldPos, e);
      this.updateCursor();
      this.onDirty();
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    const screenPos = this.getCanvasOffset(e);

    if (this.isPanning) {
      this.isPanning = false;
      this.updateCursor();
      this.onDirty();
      return;
    }

    if (this.currentTool && e.button === 0) {
      const worldPos = this.screenToWorld(screenPos);
      this.currentTool.onMouseUp(worldPos, e);
      this.updateCursor();
      this.onDirty();
    }
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const screenPos = this.getCanvasOffset(e);
    this.camera.zoomAt(screenPos.x, screenPos.y, e.deltaY);
    this.onDirty();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Space for pan mode
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      this.spacePressed = true;
      this.updateCursor();
      return;
    }

    // Delete / Backspace removes selected elements
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Avoid interfering with input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      this.canvas.dispatchEvent(new CustomEvent('venue:deleteSelected'));
      this.onDirty();
      return;
    }

    // Ctrl+Z / Cmd+Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.canvas.dispatchEvent(new CustomEvent('venue:undo'));
      this.onDirty();
      return;
    }

    // Ctrl+Y / Cmd+Shift+Z for redo
    if (
      ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
    ) {
      e.preventDefault();
      this.canvas.dispatchEvent(new CustomEvent('venue:redo'));
      this.onDirty();
      return;
    }

    // Delegate to current tool
    if (this.currentTool && this.currentTool.onKeyDown) {
      this.currentTool.onKeyDown(e);
      this.onDirty();
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (e.code === 'Space') {
      this.spacePressed = false;
      this.updateCursor();
    }
  }

  private handleContextMenu(e: MouseEvent): void {
    e.preventDefault();
  }
}
