import { ElementData, ElementType } from '../core/types';
import { COLORS } from '../theme/colors';
import { FONT_FAMILY } from '../utils/constants';
import { pointInRect } from '../utils/math';
import { BaseElement } from './BaseElement';

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 40;
const CORNER_RADIUS = 6;
const SHADOW_BLUR = 5;
const SHADOW_OFFSET_Y = 2;
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.07)';

/**
 * Bar counter element.
 * Top-down view: a long counter shape with bar-stool indicators along the front.
 */
export class BarElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    super({
      ...data,
      type: 'bar' as ElementType,
      width: data.width ?? DEFAULT_WIDTH,
      height: data.height ?? DEFAULT_HEIGHT,
      metadata: {
        label: 'Bar',
        stools: 4,
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

      // Main bar body
      ctx.fillStyle = COLORS.elements.barFill;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.fill();
      ctx.restore();

      // Stroke
      ctx.strokeStyle = COLORS.elements.barStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.stroke();

      // Counter top edge (thicker bar top line)
      ctx.fillStyle = COLORS.elements.barTop;
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, width - 6, 8, 3);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Bar stool indicators along the bottom edge
      const stools = (this.metadata.stools as number) || 4;
      const stoolRadius = Math.min(6, (width - 20) / (stools * 3));
      const stoolY = y + height + stoolRadius + 4;
      const stoolSpacing = (width - 16) / (stools + 1);

      ctx.strokeStyle = COLORS.elements.barStroke;
      ctx.lineWidth = 1;
      ctx.fillStyle = '#FFFFFF';

      for (let i = 1; i <= stools; i++) {
        const stoolX = x + 8 + stoolSpacing * i;

        // Stool circle
        ctx.beginPath();
        ctx.arc(stoolX, stoolY, stoolRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Label
      const label = this.metadata.label || 'Bar';
      const fontSize = Math.min(12, Math.min(width, height) * 0.3);
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
    // Expand downward to include stool area
    const stoolExtra = 18;
    return pointInRect(px, py, this.x, this.y, this.width, this.height + stoolExtra);
  }
}
