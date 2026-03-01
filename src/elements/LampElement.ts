import { ElementData, ElementType } from '../core/types';
import { COLORS } from '../theme/colors';
import { pointInCircle } from '../utils/math';
import { BaseElement } from './BaseElement';

const DEFAULT_SIZE = 30;

/**
 * Floor lamp / light fixture element.
 * Top-down view: a small circle with a glow ring around it.
 */
export class LampElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    super({
      ...data,
      type: 'lamp' as ElementType,
      width: data.width ?? DEFAULT_SIZE,
      height: data.height ?? DEFAULT_SIZE,
      metadata: {
        label: 'Lamp',
        ...data.metadata,
      },
    });
  }

  draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void {
    this.withRotation(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const radius = Math.min(this.width, this.height) / 2;

      // Outer glow ring
      const glowRadius = radius * 1.4;
      ctx.fillStyle = COLORS.elements.lampGlow;
      ctx.globalAlpha = 0.12;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Middle glow ring
      ctx.fillStyle = COLORS.elements.lampGlow;
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Shadow for the lamp body
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;

      // Lamp body (the fixture circle)
      ctx.fillStyle = COLORS.elements.lampFill;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Lamp body stroke
      ctx.strokeStyle = COLORS.elements.lampStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      // Inner bright dot (the bulb)
      ctx.fillStyle = COLORS.elements.lampGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Light ray lines (4 cardinal + 4 diagonal)
      ctx.strokeStyle = COLORS.elements.lampStroke;
      ctx.lineWidth = 0.75;
      ctx.globalAlpha = 0.25;
      const rayCount = 8;
      const innerR = radius * 0.75;
      const outerR = radius * 1.05;

      for (let i = 0; i < rayCount; i++) {
        const angle = (i * Math.PI * 2) / rayCount;
        ctx.beginPath();
        ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
        ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Selection / hover outline
      this.drawSelectionOutline(ctx, isSelected, isHovered);
    });
  }

  hitTest(px: number, py: number): boolean {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const radius = Math.min(this.width, this.height) / 2 * 1.4; // include glow
    return pointInCircle(px, py, cx, cy, radius);
  }
}
