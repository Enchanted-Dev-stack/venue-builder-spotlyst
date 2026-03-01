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

    const defaults = this.getDefaults();

    // Center on click position, then snap the final top-left to grid
    x = x - defaults.width / 2;
    y = y - defaults.height / 2;

    if (this.ctx.snapToGrid) {
      const effectiveGrid = this.getEffectiveGridSize();
      x = snapToGrid(x, effectiveGrid);
      y = snapToGrid(y, effectiveGrid);
    }

    const data: any = {
      type: this.elementType,
      x,
      y,
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

    const defaults = this.getDefaults();

    // Center on cursor, then snap the final top-left to grid
    x = x - defaults.width / 2;
    y = y - defaults.height / 2;

    if (this.ctx.snapToGrid) {
      const effectiveGrid = this.getEffectiveGridSize();
      x = snapToGrid(x, effectiveGrid);
      y = snapToGrid(y, effectiveGrid);
    }

    // Store the center for preview rendering
    this.previewPos = { x: x + defaults.width / 2, y: y + defaults.height / 2 };
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
          height: 10,
          metadata: {},
        };
      case 'plant':
        return {
          width: 40,
          height: 40,
          metadata: { label: 'Plant' },
        };
      case 'counter':
        return {
          width: 140,
          height: 50,
          metadata: { label: 'Counter' },
        };
      case 'booth':
        return {
          width: 100,
          height: 70,
          metadata: { label: 'Booth', capacity: 4 },
        };
      case 'divider':
        return {
          width: 80,
          height: 8,
          metadata: { label: 'Divider' },
        };
      case 'bar':
        return {
          width: 160,
          height: 40,
          metadata: { label: 'Bar', stools: 4 },
        };
      case 'lamp':
        return {
          width: 30,
          height: 30,
          metadata: { label: 'Lamp' },
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
