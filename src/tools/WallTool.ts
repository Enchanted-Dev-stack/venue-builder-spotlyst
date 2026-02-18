import { BaseTool, ToolContext } from './BaseTool';
import { Point } from '../core/types';
import { snapToGrid } from '../utils/math';
import { WALL_THICKNESS } from '../utils/constants';

export class WallTool extends BaseTool {
  private points: Point[] = [];
  private previewPoint: Point | null = null;

  constructor(context: ToolContext) {
    super(context);
  }

  onMouseDown(worldPos: Point, e: MouseEvent): void {
    let x = worldPos.x;
    let y = worldPos.y;

    if (this.ctx.snapToGrid) {
      x = snapToGrid(x, this.ctx.gridSize);
      y = snapToGrid(y, this.ctx.gridSize);
    }

    // Double-click finishes the wall
    if (e.detail >= 2 && this.points.length >= 2) {
      this.finishWall();
      return;
    }

    this.points.push({ x, y });
  }

  onMouseMove(worldPos: Point, _e: MouseEvent): void {
    let x = worldPos.x;
    let y = worldPos.y;

    if (this.ctx.snapToGrid) {
      x = snapToGrid(x, this.ctx.gridSize);
      y = snapToGrid(y, this.ctx.gridSize);
    }

    this.previewPoint = { x, y };
  }

  onMouseUp(_worldPos: Point, _e: MouseEvent): void {
    // Nothing to do - wall drawing uses clicks, not drag
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      // Cancel current wall
      this.points = [];
      this.previewPoint = null;
    }

    if (e.key === 'Enter' && this.points.length >= 2) {
      this.finishWall();
    }
  }

  /** Returns the current wall preview data for rendering. */
  getCurrentWallPreview(): { points: Point[]; previewPoint: Point | null } | null {
    if (this.points.length === 0 && !this.previewPoint) return null;
    return {
      points: [...this.points],
      previewPoint: this.previewPoint,
    };
  }

  getCursor(): string {
    return 'crosshair';
  }

  activate(): void {
    this.points = [];
    this.previewPoint = null;
  }

  deactivate(): void {
    // If we have enough points, finish the wall before switching tools
    if (this.points.length >= 2) {
      this.finishWall();
    }
    this.points = [];
    this.previewPoint = null;
  }

  private finishWall(): void {
    if (this.points.length < 2) return;

    // Calculate bounding box from points
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const pt of this.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    }

    const thickness = WALL_THICKNESS;
    const width = Math.max(maxX - minX, thickness);
    const height = Math.max(maxY - minY, thickness);

    const wallData: any = {
      type: 'wall',
      x: minX,
      y: minY,
      width,
      height,
      rotation: 0,
      metadata: {
        points: this.points.map(p => ({ x: p.x, y: p.y })),
        thickness,
      },
    };

    const element = this.ctx.elementManager.createFromData(wallData);
    this.ctx.selectionManager.clearSelection();
    this.ctx.selectionManager.select(element);

    // Reset for next wall
    this.points = [];
    this.previewPoint = null;

    this.ctx.onStateChanged();
  }
}
