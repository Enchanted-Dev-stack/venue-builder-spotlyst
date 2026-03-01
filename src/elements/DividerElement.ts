import { ElementData, ElementType } from '../core/types';
import { COLORS } from '../theme/colors';
import { pointInRect } from '../utils/math';
import { BaseElement } from './BaseElement';

const DEFAULT_WIDTH = 80;
const DEFAULT_HEIGHT = 8;
const CORNER_RADIUS = 2;

/**
 * Divider / partition screen element.
 * Top-down view: a thin decorative panel with segment marks.
 */
export class DividerElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    super({
      ...data,
      type: 'divider' as ElementType,
      width: data.width ?? DEFAULT_WIDTH,
      height: data.height ?? DEFAULT_HEIGHT,
      metadata: {
        label: 'Divider',
        ...data.metadata,
      },
    });
  }

  draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void {
    this.withRotation(ctx, () => {
      const { x, y, width, height } = this;

      // Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;

      // Main body
      ctx.fillStyle = COLORS.elements.dividerFill;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.fill();
      ctx.restore();

      // Stroke
      ctx.strokeStyle = COLORS.elements.dividerStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.stroke();

      // Decorative segment marks (3 evenly spaced dividers)
      const segCount = 3;
      ctx.strokeStyle = COLORS.elements.dividerStroke;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35;

      const isHorizontal = width >= height;

      if (isHorizontal) {
        for (let i = 1; i <= segCount; i++) {
          const sx = x + (width / (segCount + 1)) * i;
          ctx.beginPath();
          ctx.moveTo(sx, y + 1);
          ctx.lineTo(sx, y + height - 1);
          ctx.stroke();
        }
      } else {
        for (let i = 1; i <= segCount; i++) {
          const sy = y + (height / (segCount + 1)) * i;
          ctx.beginPath();
          ctx.moveTo(x + 1, sy);
          ctx.lineTo(x + width - 1, sy);
          ctx.stroke();
        }
      }

      // Center decorative line
      ctx.lineWidth = 0.75;
      if (isHorizontal) {
        const midY = y + height / 2;
        ctx.beginPath();
        ctx.moveTo(x + 4, midY);
        ctx.lineTo(x + width - 4, midY);
        ctx.stroke();
      } else {
        const midX = x + width / 2;
        ctx.beginPath();
        ctx.moveTo(midX, y + 4);
        ctx.lineTo(midX, y + height - 4);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Selection / hover outline
      this.drawSelectionOutline(ctx, isSelected, isHovered);
    });
  }

  hitTest(px: number, py: number): boolean {
    // Expand hit area slightly for thin dividers
    const pad = Math.max(4, (10 - this.height) / 2);
    return pointInRect(px, py, this.x, this.y - pad, this.width, this.height + pad * 2);
  }
}
