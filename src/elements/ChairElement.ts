import { ElementData, ElementType } from '../core/types';
import { COLORS } from '../theme/colors';
import { pointInRect } from '../utils/math';
import { BaseElement } from './BaseElement';

const DEFAULT_SIZE = 30;
const CORNER_RADIUS = 6;
const SHADOW_BLUR = 3;
const SHADOW_OFFSET_Y = 1;
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.06)';

export class ChairElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    super({
      ...data,
      type: 'chair' as ElementType,
      width: data.width ?? DEFAULT_SIZE,
      height: data.height ?? DEFAULT_SIZE,
      metadata: {
        ...data.metadata,
      },
    });
  }

  /**
   * Draws the chair. An optional `statusColor` override can be passed via
   * metadata._statusColor when the chair inherits its group's status.
   */
  draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void {
    this.withRotation(ctx, () => {
      const statusOverride = this.metadata._statusColor as
        | { fill: string; stroke: string; blocked?: boolean }
        | undefined;

      const fillColor = statusOverride?.fill ?? COLORS.elements.chairFill;
      const strokeColor = statusOverride?.stroke ?? COLORS.elements.chairStroke;
      const isBlocked = statusOverride?.blocked === true;

      // Apply faded look for blocked chairs (matching grouped table)
      if (isBlocked) {
        ctx.globalAlpha = 0.45;
      }

      // Shadow
      ctx.save();
      ctx.shadowColor = SHADOW_COLOR;
      ctx.shadowBlur = SHADOW_BLUR;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = SHADOW_OFFSET_Y;

      // Fill
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, CORNER_RADIUS);
      ctx.fill();
      ctx.restore(); // remove shadow

      // Stroke
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, this.width, this.height, CORNER_RADIUS);
      ctx.stroke();

      // Small "seat back" indicator — a slightly thicker line across the top
      const backY = this.y + 2;
      const inset = 5;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.x + inset, backY);
      ctx.lineTo(this.x + this.width - inset, backY);
      ctx.stroke();
      ctx.lineCap = 'butt';

      // Reset alpha before selection outline so it draws at full opacity
      if (isBlocked) {
        ctx.globalAlpha = 1;
      }

      // Selection / hover outline
      this.drawSelectionOutline(ctx, isSelected, isHovered);
    });
  }

  hitTest(px: number, py: number): boolean {
    return pointInRect(px, py, this.x, this.y, this.width, this.height);
  }
}
