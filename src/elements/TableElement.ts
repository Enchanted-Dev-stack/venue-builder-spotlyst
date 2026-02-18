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

      if (label) {
        const fontSize = Math.min(14, Math.min(this.width, this.height) * 0.28);
        ctx.fillStyle = COLORS.text.body;
        ctx.font = `600 ${fontSize}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, cx, cy);
      }

      // Capacity subtitle (only when table number is shown)
      if (this.metadata.tableNumber != null && this.metadata.capacity != null) {
        const subSize = Math.min(10, Math.min(this.width, this.height) * 0.18);
        ctx.fillStyle = COLORS.text.caption;
        ctx.font = `400 ${subSize}px ${FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`×${this.metadata.capacity}`, cx, cy + subSize + 2);
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
