import { ElementData, ElementType } from '../core/types';
import { COLORS } from '../theme/colors';
import { pointInRect } from '../utils/math';
import { BaseElement } from './BaseElement';

const DEFAULT_WIDTH = 60;
const DEFAULT_HEIGHT = 10;
const CORNER_RADIUS = 2;

export class WindowElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    super({
      ...data,
      type: 'window' as ElementType,
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

      // Glass fill
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = 1;

      ctx.fillStyle = COLORS.elements.windowFill;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.fill();
      ctx.restore();

      // Outer stroke
      ctx.strokeStyle = COLORS.elements.windowStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, CORNER_RADIUS);
      ctx.stroke();

      // Parallel glass lines inside — evenly spaced horizontal lines
      // that run along the longer axis
      const isHorizontal = width >= height;
      const lineCount = 2;

      ctx.strokeStyle = COLORS.elements.windowStroke;
      ctx.lineWidth = 0.75;
      ctx.globalAlpha = 0.5;

      if (isHorizontal) {
        const spacing = height / (lineCount + 1);
        for (let i = 1; i <= lineCount; i++) {
          const ly = y + spacing * i;
          ctx.beginPath();
          ctx.moveTo(x + 3, ly);
          ctx.lineTo(x + width - 3, ly);
          ctx.stroke();
        }
      } else {
        const spacing = width / (lineCount + 1);
        for (let i = 1; i <= lineCount; i++) {
          const lx = x + spacing * i;
          ctx.beginPath();
          ctx.moveTo(lx, y + 3);
          ctx.lineTo(lx, y + height - 3);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      // Center divider (mullion) for a realistic window look
      ctx.strokeStyle = COLORS.elements.windowStroke;
      ctx.lineWidth = 1.5;
      if (isHorizontal) {
        const midX = x + width / 2;
        ctx.beginPath();
        ctx.moveTo(midX, y + 1);
        ctx.lineTo(midX, y + height - 1);
        ctx.stroke();
      } else {
        const midY = y + height / 2;
        ctx.beginPath();
        ctx.moveTo(x + 1, midY);
        ctx.lineTo(x + width - 1, midY);
        ctx.stroke();
      }

      // Selection / hover outline
      this.drawSelectionOutline(ctx, isSelected, isHovered);
    });
  }

  hitTest(px: number, py: number): boolean {
    return pointInRect(px, py, this.x, this.y, this.width, this.height);
  }
}
