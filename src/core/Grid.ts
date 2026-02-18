import { Camera } from './Camera';
import { COLORS } from '../theme/colors';

/**
 * Draws an infinite-feeling background grid that respects the current camera
 * pan / zoom.  Minor lines are drawn every `gridSize` world-units and major
 * lines every `5 × gridSize` world-units.
 */
export class Grid {
  gridSize: number;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
  }

  /**
   * Render the grid into the given canvas context.
   *
   * The method calculates which world-space lines are visible given the
   * current camera transform and only draws those, keeping the per-frame
   * cost proportional to the viewport size rather than the total world size.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    canvasWidth: number,
    canvasHeight: number,
    dpr: number = 1,
  ): void {
    // Determine the visible world-space rectangle.
    const topLeft = camera.screenToWorld(0, 0);
    const bottomRight = camera.screenToWorld(canvasWidth, canvasHeight);

    const minorStep = this.gridSize;
    const majorStep = this.gridSize * 5;

    // Expand bounds to the nearest grid lines just outside the viewport so
    // partial lines at the edges are still drawn.
    const startX = Math.floor(topLeft.x / minorStep) * minorStep;
    const endX = Math.ceil(bottomRight.x / minorStep) * minorStep;
    const startY = Math.floor(topLeft.y / minorStep) * minorStep;
    const endY = Math.ceil(bottomRight.y / minorStep) * minorStep;

    ctx.save();
    camera.applyTransform(ctx, dpr);

    // --- Minor grid lines ---------------------------------------------------
    ctx.strokeStyle = COLORS.canvas.gridMinor;
    ctx.lineWidth = 0.5 / camera.zoom; // constant screen-space thickness
    ctx.beginPath();

    for (let x = startX; x <= endX; x += minorStep) {
      // Skip positions that will be covered by a major line
      if (x % majorStep === 0) continue;
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }

    for (let y = startY; y <= endY; y += minorStep) {
      if (y % majorStep === 0) continue;
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }

    ctx.stroke();

    // --- Major grid lines ---------------------------------------------------
    ctx.strokeStyle = COLORS.canvas.gridMajor;
    ctx.lineWidth = 1 / camera.zoom;
    ctx.beginPath();

    const majorStartX = Math.floor(topLeft.x / majorStep) * majorStep;
    const majorEndX = Math.ceil(bottomRight.x / majorStep) * majorStep;
    const majorStartY = Math.floor(topLeft.y / majorStep) * majorStep;
    const majorEndY = Math.ceil(bottomRight.y / majorStep) * majorStep;

    for (let x = majorStartX; x <= majorEndX; x += majorStep) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }

    for (let y = majorStartY; y <= majorEndY; y += majorStep) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }

    ctx.stroke();

    ctx.restore();
  }
}
