import { Camera } from '../core/Camera';
import { ElementManager } from '../core/ElementManager';
import { SelectionManager } from '../core/SelectionManager';
import { GroupManager } from '../core/GroupManager';
import { Point } from '../core/types';

export interface ToolContext {
  camera: Camera;
  elementManager: ElementManager;
  selectionManager: SelectionManager;
  groupManager: GroupManager;
  canvas: HTMLCanvasElement;
  gridSize: number;
  snapToGrid: boolean;
  onStateChanged: () => void;
}

export abstract class BaseTool {
  protected ctx: ToolContext;

  constructor(context: ToolContext) {
    this.ctx = context;
  }

  abstract onMouseDown(worldPos: Point, e: MouseEvent): void;
  abstract onMouseMove(worldPos: Point, e: MouseEvent): void;
  abstract onMouseUp(worldPos: Point, e: MouseEvent): void;

  onKeyDown?(e: KeyboardEvent): void;

  /** Returns cursor style for this tool. */
  getCursor(): string {
    return 'default';
  }

  /** Called when tool is activated. */
  activate(): void {}

  /** Called when tool is deactivated. */
  deactivate(): void {}
}
