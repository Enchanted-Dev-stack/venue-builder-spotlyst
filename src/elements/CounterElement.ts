import { ElementData, ElementType } from '../core/types';
import { COLORS } from '../theme/colors';
import { FONT_FAMILY } from '../utils/constants';
import { pointInRect } from '../utils/math';
import { BaseElement } from './BaseElement';

const DEFAULT_WIDTH = 140;
const DEFAULT_HEIGHT = 50;
const CORNER_RADIUS = 10;
const SHADOW_BLUR = 6;
const SHADOW_OFFSET_Y = 2;
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.08)';

/**
 * Reception / service counter element.
 * Top-down view: a long rounded rectangle with a counter-top edge line.
 */
export class CounterElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    super({
      ...data,
      type: 'counter' as ElementType,
      width: data.width ?? DEFAULT_WIDTH,
      height: data.height ?? DEFAULT_HEIGHT,
      metadata: {
        label: 'Counter',
        ...data.metadata,
      },
    });
  }

  draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void {
    this.withRotation(ctx, () => {
      const { x, y, width, height } = this;
      const cx = x + width / 2;
      const cy = y + height / 2;

      // Shadow
      ctx.save();
      ctx.shadowColor = SHADOW_COLOR;
      ctx.shadowBlur = SHADOW_BLUR;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = SHADOW_OFFSET_Y;

      // Counter body
      ctx.fillStyle = COLORS.elements.counterFill;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.fill();
      ctx.restore();

      // Stroke
      ctx.strokeStyle = COLORS.elements.counterStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.stroke();

      // Counter-top edge line (the service edge) — a thicker stripe along the front
      const edgeY = y + height - 8;
      ctx.fillStyle = COLORS.elements.counterTop;
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.roundRect(x + 4, edgeY, width - 8, 6, 3);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Inner detail lines (register/till indicators)
      ctx.strokeStyle = COLORS.elements.counterStroke;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      // Left register area
      ctx.beginPath();
      ctx.roundRect(x + 10, y + 8, 24, 18, 3);
      ctx.stroke();

      // Right register area
      ctx.beginPath();
      ctx.roundRect(x + width - 34, y + 8, 24, 18, 3);
      ctx.stroke();

      ctx.globalAlpha = 1;

      // Label
      const label = this.metadata.label || 'Counter';
      const fontSize = Math.min(12, Math.min(width, height) * 0.25);
      ctx.fillStyle = COLORS.text.body;
      ctx.font = `600 ${fontSize}px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy);

      // Selection / hover outline
      this.drawSelectionOutline(ctx, isSelected, isHovered);
    });
  }

  hitTest(px: number, py: number): boolean {
    return pointInRect(px, py, this.x, this.y, this.width, this.height);
  }
}
