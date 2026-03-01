import { ElementData, ElementType } from '../core/types';
import { COLORS } from '../theme/colors';
import { FONT_FAMILY } from '../utils/constants';
import { pointInRect } from '../utils/math';
import { BaseElement } from './BaseElement';

const DEFAULT_WIDTH = 100;
const DEFAULT_HEIGHT = 70;
const CORNER_RADIUS = 8;
const SHADOW_BLUR = 5;
const SHADOW_OFFSET_Y = 2;
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.07)';

/**
 * Booth / sofa seating element.
 * Top-down view: a U-shaped seat (open at the top) — three-sided cushion.
 */
export class BoothElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    super({
      ...data,
      type: 'booth' as ElementType,
      width: data.width ?? DEFAULT_WIDTH,
      height: data.height ?? DEFAULT_HEIGHT,
      metadata: {
        label: 'Booth',
        capacity: 4,
        ...data.metadata,
      },
    });
  }

  draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void {
    this.withRotation(ctx, () => {
      const { x, y, width, height } = this;
      const cx = x + width / 2;
      const cy = y + height / 2;
      const armWidth = Math.min(14, width * 0.14);
      const backHeight = Math.min(14, height * 0.2);

      // Shadow
      ctx.save();
      ctx.shadowColor = SHADOW_COLOR;
      ctx.shadowBlur = SHADOW_BLUR;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = SHADOW_OFFSET_Y;

      // Outer frame (the full rectangle for the booth footprint)
      ctx.fillStyle = COLORS.elements.boothFill;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.fill();
      ctx.restore();

      // Stroke
      ctx.strokeStyle = COLORS.elements.boothStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.stroke();

      // U-shape cushion: back wall + two side arms
      // Back cushion (bottom)
      ctx.fillStyle = COLORS.elements.boothCushion;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.roundRect(x + 3, y + height - backHeight - 2, width - 6, backHeight, 4);
      ctx.fill();

      // Left arm
      ctx.beginPath();
      ctx.roundRect(x + 3, y + 3, armWidth, height - backHeight - 6, [4, 0, 0, 4]);
      ctx.fill();

      // Right arm
      ctx.beginPath();
      ctx.roundRect(x + width - armWidth - 3, y + 3, armWidth, height - backHeight - 6, [0, 4, 4, 0]);
      ctx.fill();

      ctx.globalAlpha = 1;

      // Cushion stitch lines
      ctx.strokeStyle = COLORS.elements.boothStroke;
      ctx.lineWidth = 0.75;
      ctx.globalAlpha = 0.25;

      // Horizontal stitch on back cushion
      const stitchY = y + height - backHeight / 2 - 2;
      ctx.beginPath();
      ctx.moveTo(x + 8, stitchY);
      ctx.lineTo(x + width - 8, stitchY);
      ctx.stroke();

      ctx.globalAlpha = 1;

      // Label
      const label = this.metadata.label || 'Booth';
      const fontSize = Math.min(11, Math.min(width, height) * 0.2);
      ctx.fillStyle = COLORS.text.body;
      ctx.font = `500 ${fontSize}px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy - 4);

      // Capacity
      if (this.metadata.capacity) {
        const subSize = Math.min(9, fontSize * 0.8);
        ctx.fillStyle = COLORS.text.caption;
        ctx.font = `400 ${subSize}px ${FONT_FAMILY}`;
        ctx.fillText(`seats ${this.metadata.capacity}`, cx, cy + subSize + 1);
      }

      // Selection / hover outline
      this.drawSelectionOutline(ctx, isSelected, isHovered);
    });
  }

  hitTest(px: number, py: number): boolean {
    return pointInRect(px, py, this.x, this.y, this.width, this.height);
  }
}
