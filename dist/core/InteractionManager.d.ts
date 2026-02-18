import { Camera } from './Camera';
import { BaseTool } from '../tools/BaseTool';
/**
 * Handles all mouse and keyboard events on the canvas, converting screen
 * coordinates to world coordinates and delegating to the active tool.
 *
 * Also manages canvas-level interactions like space+drag panning and
 * scroll-wheel zooming that are independent of the current tool.
 */
export declare class InteractionManager {
    private canvas;
    private camera;
    private currentTool;
    private isPanning;
    private panStart;
    private spacePressed;
    private onDirty;
    private boundHandleMouseDown;
    private boundHandleMouseMove;
    private boundHandleMouseUp;
    private boundHandleWheel;
    private boundHandleKeyDown;
    private boundHandleKeyUp;
    private boundHandleContextMenu;
    constructor(canvas: HTMLCanvasElement, camera: Camera, onDirty: () => void);
    setTool(tool: BaseTool): void;
    getTool(): BaseTool | null;
    /** Binds all event listeners to the canvas and document. */
    bind(): void;
    /** Removes all event listeners. */
    unbind(): void;
    private getCanvasOffset;
    private screenToWorld;
    private updateCursor;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private handleWheel;
    private handleKeyDown;
    private handleKeyUp;
    private handleContextMenu;
}
