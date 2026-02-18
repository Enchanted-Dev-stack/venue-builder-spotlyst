import { BaseTool, ToolContext } from './BaseTool';
import { Point } from '../core/types';
export declare class SelectTool extends BaseTool {
    private isDragging;
    private isResizing;
    private hasMoved;
    private dragStartWorld;
    private dragOriginalPositions;
    private activeHandle;
    private resizeElementId;
    private resizeStartBounds;
    constructor(context: ToolContext);
    onMouseDown(worldPos: Point, e: MouseEvent): void;
    onMouseMove(worldPos: Point, _e: MouseEvent): void;
    onMouseUp(_worldPos: Point, _e: MouseEvent): void;
    onKeyDown(e: KeyboardEvent): void;
    getCursor(): string;
}
