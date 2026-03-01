import { ElementData, ElementType } from '../core/types';
import { COLORS } from '../theme/colors';
import { pointInCircle } from '../utils/math';
import { BaseElement } from './BaseElement';

const DEFAULT_SIZE = 40;
const SHADOW_BLUR = 4;
const SHADOW_OFFSET_Y = 1;
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.06)';

/**
 * A decorative potted plant element.
 * Top-down view: a circular pot with leaf shapes radiating from the center.
 */
export class PlantElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    super({
      ...data,
      type: 'plant' as ElementType,
      width: data.width ?? DEFAULT_SIZE,
      height: data.height ?? DEFAULT_SIZE,
      metadata: {
        label: 'Plant',
        ...data.metadata,
      },
    });
  }

  draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void {
    this.withRotation(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const radius = Math.min(this.width, this.height) / 2;

      // Shadow
      ctx.save();
      ctx.shadowColor = SHADOW_COLOR;
      ctx.shadowBlur = SHADOW_BLUR;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = SHADOW_OFFSET_Y;

      // Outer pot circle
      ctx.fillStyle = COLORS.elements.plantFill;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Pot stroke
      ctx.strokeStyle = COLORS.elements.plantStroke;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner pot circle (the pot rim)
      const potRadius = radius * 0.4;
      ctx.fillStyle = COLORS.elements.plantPot;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, potRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Leaf shapes radiating outward
      const leafCount = 6;
      const leafLength = radius * 0.7;
      const leafWidth = radius * 0.32;

      ctx.fillStyle = COLORS.elements.plantLeaf;
      ctx.globalAlpha = 0.6;

      for (let i = 0; i < leafCount; i++) {
        const angle = (i * Math.PI * 2) / leafCount - Math.PI / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.ellipse(leafLength * 0.5, 0, leafLength * 0.5, leafWidth * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.globalAlpha = 1;

      // Center dot
      ctx.fillStyle = COLORS.elements.plantStroke;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Selection / hover outline
      this.drawSelectionOutline(ctx, isSelected, isHovered);
    });
  }

  hitTest(px: number, py: number): boolean {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const radius = Math.min(this.width, this.height) / 2;
    return pointInCircle(px, py, cx, cy, radius);
  }
}
