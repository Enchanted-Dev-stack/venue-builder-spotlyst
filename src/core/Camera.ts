import { Point } from './types';
import { clamp } from '../utils/math';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_SPEED } from '../utils/constants';

/**
 * Manages a 2-D camera (pan + zoom) for the canvas viewport.
 *
 * World-space coordinates are the "true" positions of elements.
 * Screen-space coordinates are what the user sees after the camera transform
 * has been applied:
 *
 *   screen = world * zoom + pan
 *   world  = (screen - pan) / zoom
 */
export class Camera {
  /** Horizontal pan offset (in screen pixels). */
  x: number = 0;
  /** Vertical pan offset (in screen pixels). */
  y: number = 0;
  /** Current zoom level (1 = 100 %). */
  zoom: number = 1;

  /**
   * Convert screen (pixel) coordinates to world coordinates.
   */
  screenToWorld(screenX: number, screenY: number): Point {
    return {
      x: (screenX - this.x) / this.zoom,
      y: (screenY - this.y) / this.zoom,
    };
  }

  /**
   * Convert world coordinates to screen (pixel) coordinates.
   */
  worldToScreen(worldX: number, worldY: number): Point {
    return {
      x: worldX * this.zoom + this.x,
      y: worldY * this.zoom + this.y,
    };
  }

  /**
   * Apply the camera's transform to a canvas 2-D rendering context so that
   * subsequent draw calls are automatically mapped from world-space to
   * screen-space.
   */
  applyTransform(ctx: CanvasRenderingContext2D, dpr: number = 1): void {
    ctx.setTransform(this.zoom * dpr, 0, 0, this.zoom * dpr, this.x * dpr, this.y * dpr);
  }

  /**
   * Zoom the camera toward / away from the given screen-space position.
   *
   * @param screenX  Screen X of the zoom focal point (e.g. mouse position).
   * @param screenY  Screen Y of the zoom focal point.
   * @param delta    Signed scroll delta (positive = zoom out, negative = zoom in).
   */
  zoomAt(screenX: number, screenY: number, delta: number): void {
    const prevZoom = this.zoom;
    const newZoom = clamp(prevZoom * (1 - delta * ZOOM_SPEED), MIN_ZOOM, MAX_ZOOM);

    // Adjust pan so the world point under the cursor stays fixed on screen.
    // Before: screenX = worldX * prevZoom + this.x
    // After:  screenX = worldX * newZoom  + newX
    // => newX = screenX - worldX * newZoom
    //         = screenX - ((screenX - this.x) / prevZoom) * newZoom
    const worldX = (screenX - this.x) / prevZoom;
    const worldY = (screenY - this.y) / prevZoom;

    this.x = screenX - worldX * newZoom;
    this.y = screenY - worldY * newZoom;
    this.zoom = newZoom;
  }

  /**
   * Pan the camera by a screen-space delta.
   */
  panBy(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  /**
   * Reset to default (no pan, zoom = 1).
   */
  reset(): void {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
  }
}
