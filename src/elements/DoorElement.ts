import { ElementData, ElementType } from '../core/types';
import { COLORS } from '../theme/colors';
import { pointInRect } from '../utils/math';
import { BaseElement } from './BaseElement';

const DEFAULT_WIDTH = 40;
const DEFAULT_HEIGHT = 10;
const CORNER_RADIUS = 2;

export class DoorElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    super({
      ...data,
      type: 'door' as ElementType,
      width: data.width ?? DEFAULT_WIDTH,
      height: data.height ?? DEFAULT_HEIGHT,
      metadata: {
        ...data.metadata,
      },
    });
  }

  draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void {
    this.withRotation(ctx, () => {
      const { x, y, width, height } = this;

      // Door body (the opening in the wall)
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;

      ctx.fillStyle = COLORS.elements.doorFill;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = COLORS.elements.doorStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.stroke();

      // Door swing arc — drawn from the left hinge, sweeping upward
      const hingeX = x;
      const hingeY = y + height;
      const swingRadius = width * 0.75;

      ctx.strokeStyle = COLORS.elements.doorStroke;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(hingeX, hingeY, swingRadius, -Math.PI / 2, 0, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // Door leaf line (the actual door panel, closed position)
      ctx.strokeStyle = COLORS.elements.doorStroke;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hingeX, hingeY);
      ctx.lineTo(hingeX + swingRadius, hingeY);
      ctx.stroke();
      ctx.lineCap = 'butt';

      // Small hinge dot
      ctx.fillStyle = COLORS.elements.doorStroke;
      ctx.beginPath();
      ctx.arc(hingeX, hingeY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Selection / hover outline
      this.drawSelectionOutline(ctx, isSelected, isHovered);
    });
  }

  hitTest(px: number, py: number): boolean {
    // Use a slightly expanded rect to include the swing area
    const expandedHeight = this.height + this.width * 0.75;
    return pointInRect(px, py, this.x, this.y, this.width, expandedHeight);
  }
}
