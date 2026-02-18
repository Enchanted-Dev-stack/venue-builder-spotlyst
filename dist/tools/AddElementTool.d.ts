import { BaseTool, ToolContext } from './BaseTool';
import { Point, ElementType, TableShape } from '../core/types';
interface AddElementConfig {
    shape?: TableShape;
}
export declare class AddElementTool extends BaseTool {
    private elementType;
    private config;
    private previewPos;
    constructor(context: ToolContext, elementType: ElementType, config?: AddElementConfig);
    onMouseDown(worldPos: Point, _e: MouseEvent): void;
    onMouseMove(worldPos: Point, _e: MouseEvent): void;
    onMouseUp(_worldPos: Point, _e: MouseEvent): void;
    /** Returns preview position and type for ghost rendering. */
    getPreview(): {
        x: number;
        y: number;
        type: ElementType;
    } | null;
    getCursor(): string;
    deactivate(): void;
    private getDefaults;
}
export {};
