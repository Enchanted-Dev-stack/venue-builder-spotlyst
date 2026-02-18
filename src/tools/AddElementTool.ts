import { BaseTool, ToolContext } from './BaseTool';
import { Point, ElementType, TableShape } from '../core/types';
import { snapToGrid } from '../utils/math';

interface AddElementConfig {
  shape?: TableShape;
}

export class AddElementTool extends BaseTool {
  private elementType: ElementType;
  private config: AddElementConfig;
  private previewPos: Point | null = null;

  constructor(context: ToolContext, elementType: ElementType, config?: AddElementConfig) {
    super(context);
    this.elementType = elementType;
    this.config = config || {};
  }

  onMouseDown(worldPos: Point, _e: MouseEvent): void {
    let x = worldPos.x;
    let y = worldPos.y;

    if (this.ctx.snapToGrid) {
      x = snapToGrid(x, this.ctx.gridSize);
      y = snapToGrid(y, this.ctx.gridSize);
    }

    const defaults = this.getDefaults();

    // Center the element on the click position
    const data: any = {
      type: this.elementType,
      x: x - defaults.width / 2,
      y: y - defaults.height / 2,
      width: defaults.width,
      height: defaults.height,
      rotation: 0,
      metadata: defaults.metadata,
    };

    const element = this.ctx.elementManager.createFromData(data);

    // Select the newly created element
    this.ctx.selectionManager.clearSelection();
    this.ctx.selectionManager.select(element);

    this.ctx.onStateChanged();
  }

  onMouseMove(worldPos: Point, _e: MouseEvent): void {
    let x = worldPos.x;
    let y = worldPos.y;

    if (this.ctx.snapToGrid) {
      x = snapToGrid(x, this.ctx.gridSize);
      y = snapToGrid(y, this.ctx.gridSize);
    }

    this.previewPos = { x, y };
  }

  onMouseUp(_worldPos: Point, _e: MouseEvent): void {
    // Nothing to do
  }

  /** Returns preview position and type for ghost rendering. */
  getPreview(): { x: number; y: number; type: ElementType } | null {
    if (!this.previewPos) return null;
    return { x: this.previewPos.x, y: this.previewPos.y, type: this.elementType };
  }

  getCursor(): string {
    return 'crosshair';
  }

  deactivate(): void {
    this.previewPos = null;
  }

  private getDefaults(): { width: number; height: number; metadata: Record<string, any> } {
    switch (this.elementType) {
      case 'table':
        return {
          width: 80,
          height: 80,
          metadata: {
            shape: this.config.shape || 'rectangle',
            status: 'available',
          },
        };
      case 'chair':
        return {
          width: 30,
          height: 30,
          metadata: {},
        };
      case 'door':
        return {
          width: 40,
          height: 10,
          metadata: {},
        };
      case 'window':
        return {
          width: 60,
          height: 8,
          metadata: {},
        };
      default:
        return {
          width: 60,
          height: 60,
          metadata: {},
        };
    }
  }
}
