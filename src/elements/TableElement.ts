import { ElementData, ElementType, BookingStatus, TableShape } from '../core/types';
import { COLORS } from '../theme/colors';
import { FONT_FAMILY } from '../utils/constants';
import { pointInRect, pointInCircle } from '../utils/math';
import { BaseElement } from './BaseElement';

const DEFAULT_ROUND_SIZE = 80;
const DEFAULT_RECT_WIDTH = 100;
const DEFAULT_RECT_HEIGHT = 70;
const CORNER_RADIUS = 8;
const SHADOW_BLUR = 6;
const SHADOW_OFFSET_Y = 2;
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.08)';

export class TableElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    const shape: TableShape = data.metadata?.shape || 'rectangle';
    const isRound = shape === 'round';

    super({
      ...data,
      type: 'table' as ElementType,
      width: data.width ?? (isRound ? DEFAULT_ROUND_SIZE : DEFAULT_RECT_WIDTH),
      height: data.height ?? (isRound ? DEFAULT_ROUND_SIZE : DEFAULT_RECT_HEIGHT),
      metadata: {
        shape,
        status: 'available' as BookingStatus,
        capacity: 4,
        ...data.metadata,
      },
    });
  }

  private getStatusColors(): { fill: string; stroke: string } {
    const status = this.metadata.status as BookingStatus | undefined;
    if (status && status in COLORS.status) {
      return COLORS.status[status as keyof typeof COLORS.status];
    }
    return { fill: COLORS.elements.tableFill, stroke: COLORS.elements.tableStroke };
  }

  draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void {
    this.withRotation(ctx, () => {
      const { fill, stroke } = this.getStatusColors();
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const isRound = this.metadata.shape === 'round';
      const isBlocked = this.metadata.status === 'blocked';

      // Apply faded look for blocked tables
      if (isBlocked) {
        ctx.globalAlpha = 0.45;
      }

      // Shadow
      ctx.save();
      ctx.shadowColor = SHADOW_COLOR;
      ctx.shadowBlur = SHADOW_BLUR;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = SHADOW_OFFSET_Y;

      // Fill shape
      ctx.fillStyle = fill;
      ctx.beginPath();
      if (isRound) {
        const radius = Math.min(this.width, this.height) / 2;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      } else {
        ctx.roundRect(this.x, this.y, this.width, this.height, CORNER_RADIUS);
      }
      ctx.fill();
      ctx.restore(); // remove shadow before stroke

      // Stroke shape
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (isRound) {
        const radius = Math.min(this.width, this.height) / 2;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      } else {
        ctx.roundRect(this.x, this.y, this.width, this.height, CORNER_RADIUS);
      }
      ctx.stroke();

      // Label text (table number or capacity)
      const label =
        this.metadata.tableNumber != null
          ? `T${this.metadata.tableNumber}`
          : this.metadata.label ?? `${this.metadata.capacity ?? ''}`;

      // Determine if there's a customer name to show
      const customerName = this.metadata.customerName as string | undefined;
      const hasCustomer = customerName && customerName.trim().length > 0;

      // Adjust label vertical position when customer name is present on round tables
      const labelOffsetY = (hasCustomer && isRound) ? -6 : 0;

      if (label) {
        const fontSize = Math.min(14, Math.min(this.width, this.height) * 0.28);
        ctx.fillStyle = COLORS.text.body;
        ctx.font = `600 ${fontSize}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, cx, cy + labelOffsetY);
      }

      // Capacity subtitle (only when table number is shown)
      if (this.metadata.tableNumber != null && this.metadata.capacity != null && !hasCustomer) {
        const subSize = Math.min(10, Math.min(this.width, this.height) * 0.18);
        ctx.fillStyle = COLORS.text.caption;
        ctx.font = `400 ${subSize}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`×${this.metadata.capacity}`, cx, cy + subSize + 2);
      }

      // Customer name
      if (hasCustomer) {
        const maxNameLen = isRound
          ? Math.floor(this.width / 7)
          : Math.floor((this.width - 12) / 6);
        const truncated = customerName!.length > maxNameLen
          ? customerName!.substring(0, maxNameLen - 1) + '…'
          : customerName!;

        if (isRound) {
          // Round table: customer name centered below the label
          const nameSize = Math.min(10, Math.min(this.width, this.height) * 0.17);
          ctx.fillStyle = stroke; // use the status stroke color for emphasis
          ctx.font = `500 ${nameSize}px ${FONT_FAMILY}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(truncated, cx, cy + 8);
        } else {
          // Rectangular table: customer name at bottom-left corner
          const nameSize = Math.min(10, Math.min(this.width, this.height) * 0.18);
          const nameX = this.x + 6;
          const nameY = this.y + this.height - 6;
          ctx.fillStyle = stroke;
          ctx.font = `500 ${nameSize}px ${FONT_FAMILY}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(truncated, nameX, nameY);
        }
      }

      // Booking time slot indicator (small text, top-right for rect, below name for round)
      const bookingStart = this.metadata.bookingStart as string | undefined;
      const bookingEnd = this.metadata.bookingEnd as string | undefined;
      if (bookingStart) {
        const timeStr = bookingEnd ? `${bookingStart}–${bookingEnd}` : bookingStart;
        const timeSize = Math.min(8, Math.min(this.width, this.height) * 0.14);
        ctx.fillStyle = COLORS.text.light;
        ctx.font = `400 ${timeSize}px ${FONT_FAMILY}`;

        if (isRound) {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const timeY = hasCustomer ? cy + 18 : cy + 12;
          ctx.fillText(timeStr, cx, timeY);
        } else {
          ctx.textAlign = 'right';
          ctx.textBaseline = 'top';
          ctx.fillText(timeStr, this.x + this.width - 5, this.y + 4);
        }
      }

      // Reset alpha before selection outline so it draws at full opacity
      if (isBlocked) {
        ctx.globalAlpha = 1;
      }

      // Selection / hover outline
      this.drawSelectionOutline(ctx, isSelected, isHovered);
    });
  }

  hitTest(px: number, py: number): boolean {
    if (this.metadata.shape === 'round') {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const radius = Math.min(this.width, this.height) / 2;
      return pointInCircle(px, py, cx, cy, radius);
    }
    return pointInRect(px, py, this.x, this.y, this.width, this.height);
  }
}
