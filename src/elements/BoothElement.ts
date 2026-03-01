import { ElementData, ElementType, BookingStatus } from '../core/types';
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
        status: 'available' as BookingStatus,
        ...data.metadata,
      },
    });
  }

  private getStatusColors(): { fill: string; stroke: string } | null {
    const status = this.metadata.status as BookingStatus | undefined;
    if (status && status !== 'available' && status in COLORS.status) {
      return COLORS.status[status as keyof typeof COLORS.status];
    }
    return null;
  }

  draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void {
    this.withRotation(ctx, () => {
      const { x, y, width, height } = this;
      const cx = x + width / 2;
      const cy = y + height / 2;
      const armWidth = Math.min(14, width * 0.14);
      const backHeight = Math.min(14, height * 0.2);

      const statusColors = this.getStatusColors();
      const fillColor = statusColors?.fill ?? COLORS.elements.boothFill;
      const strokeColor = statusColors?.stroke ?? COLORS.elements.boothStroke;
      const isBlocked = this.metadata.status === 'blocked';

      if (isBlocked) {
        ctx.globalAlpha = 0.45;
      }

      // Shadow
      ctx.save();
      ctx.shadowColor = SHADOW_COLOR;
      ctx.shadowBlur = SHADOW_BLUR;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = SHADOW_OFFSET_Y;

      // Outer frame (the full rectangle for the booth footprint)
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.fill();
      ctx.restore();

      // Stroke
      ctx.strokeStyle = strokeColor;
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
      const customerName = this.metadata.customerName as string | undefined;
      const hasCustomer = customerName && customerName.trim().length > 0;
      const label = hasCustomer ? customerName! : (this.metadata.label || 'Booth');
      const fontSize = Math.min(11, Math.min(width, height) * 0.2);
      ctx.fillStyle = COLORS.text.body;
      ctx.font = `500 ${fontSize}px ${FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const maxLen = Math.floor((width - 16) / 6);
      const displayLabel = label.length > maxLen ? label.substring(0, maxLen - 1) + '…' : label;
      ctx.fillText(displayLabel, cx, cy - 4);

      // Capacity (shown only when no customer)
      if (this.metadata.capacity && !hasCustomer) {
        const subSize = Math.min(9, fontSize * 0.8);
        ctx.fillStyle = COLORS.text.caption;
        ctx.font = `400 ${subSize}px ${FONT_FAMILY}`;
        ctx.fillText(`seats ${this.metadata.capacity}`, cx, cy + subSize + 1);
      }

      // Booking time slot
      const bookingStart = this.metadata.bookingStart as string | undefined;
      const bookingEnd = this.metadata.bookingEnd as string | undefined;
      if (bookingStart && hasCustomer) {
        const timeStr = bookingEnd ? `${bookingStart}–${bookingEnd}` : bookingStart;
        const timeSize = Math.min(8, Math.min(width, height) * 0.14);
        ctx.fillStyle = COLORS.text.light;
        ctx.font = `400 ${timeSize}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeStr, cx, cy + fontSize * 0.6 + 2);
      }

      // Reset alpha before selection outline
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
