import { Point } from './types';
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
export declare class Camera {
    /** Horizontal pan offset (in screen pixels). */
    x: number;
    /** Vertical pan offset (in screen pixels). */
    y: number;
    /** Current zoom level (1 = 100 %). */
    zoom: number;
    /**
     * Convert screen (pixel) coordinates to world coordinates.
     */
    screenToWorld(screenX: number, screenY: number): Point;
    /**
     * Convert world coordinates to screen (pixel) coordinates.
     */
    worldToScreen(worldX: number, worldY: number): Point;
    /**
     * Apply the camera's transform to a canvas 2-D rendering context so that
     * subsequent draw calls are automatically mapped from world-space to
     * screen-space.
     */
    applyTransform(ctx: CanvasRenderingContext2D, dpr?: number): void;
    /**
     * Zoom the camera toward / away from the given screen-space position.
     *
     * @param screenX  Screen X of the zoom focal point (e.g. mouse position).
     * @param screenY  Screen Y of the zoom focal point.
     * @param delta    Signed scroll delta (positive = zoom out, negative = zoom in).
     */
    zoomAt(screenX: number, screenY: number, delta: number): void;
    /**
     * Pan the camera by a screen-space delta.
     */
    panBy(dx: number, dy: number): void;
    /**
     * Reset to default (no pan, zoom = 1).
     */
    reset(): void;
}
