import { Camera } from './Camera';
/**
 * Draws an infinite-feeling background grid that respects the current camera
 * pan / zoom.  Minor lines are drawn every `gridSize` world-units and major
 * lines every `5 × gridSize` world-units.
 */
export declare class Grid {
    gridSize: number;
    constructor(gridSize: number);
    /**
     * Render the grid into the given canvas context.
     *
     * The method calculates which world-space lines are visible given the
     * current camera transform and only draws those, keeping the per-frame
     * cost proportional to the viewport size rather than the total world size.
     */
    draw(ctx: CanvasRenderingContext2D, camera: Camera, canvasWidth: number, canvasHeight: number, dpr?: number): void;
}
