import { BaseTool, ToolContext } from './BaseTool';
import { Point } from '../core/types';
export declare class WallTool extends BaseTool {
    private points;
    private previewPoint;
    constructor(context: ToolContext);
    onMouseDown(worldPos: Point, e: MouseEvent): void;
    onMouseMove(worldPos: Point, _e: MouseEvent): void;
    onMouseUp(_worldPos: Point, _e: MouseEvent): void;
    onKeyDown(e: KeyboardEvent): void;
    /** Returns the current wall preview data for rendering. */
    getCurrentWallPreview(): {
        points: Point[];
        previewPoint: Point | null;
    } | null;
    getCursor(): string;
    activate(): void;
    deactivate(): void;
    private finishWall;
}
