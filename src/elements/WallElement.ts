import { ElementData, ElementType, Point } from '../core/types';
import { COLORS } from '../theme/colors';
import { WALL_THICKNESS } from '../utils/constants';
import { pointToLineDistance, getBoundingBox } from '../utils/math';
import { BaseElement } from './BaseElement';

const HIT_THRESHOLD_PADDING = 4; // extra px around the wall for easier selection

export class WallElement extends BaseElement {
  constructor(data: Partial<ElementData> = {}) {
    const points: Point[] = data.metadata?.points ?? [
      { x: data.x ?? 0, y: data.y ?? 0 },
      { x: (data.x ?? 0) + 100, y: data.y ?? 0 },
    ];

    const bounds = getBoundingBox(points);
    const thickness: number = data.metadata?.thickness ?? WALL_THICKNESS;

    super({
      ...data,
      type: 'wall' as ElementType,
      x: data.x ?? bounds.x,
      y: data.y ?? bounds.y,
      width: data.width ?? Math.max(bounds.width, thickness),
      height: data.height ?? Math.max(bounds.height, thickness),
      metadata: {
        points,
        thickness,
        ...data.metadata,
      },
    });
  }

  private get points(): Point[] {
    return (this.metadata.points as Point[]) ?? [];
  }

  private get thickness(): number {
    return (this.metadata.thickness as number) ?? WALL_THICKNESS;
  }

  draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void {
    const pts = this.points;
    if (pts.length < 2) return;

    this.withRotation(ctx, () => {
      ctx.save();

      // Subtle shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;

      ctx.strokeStyle = COLORS.elements.wallFill;
      ctx.lineWidth = this.thickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();

      ctx.restore();

      // Highlight line on top when selected or hovered
      if (isSelected || isHovered) {
        ctx.strokeStyle = isSelected ? '#4F46E5' : '#818CF8';
        ctx.lineWidth = this.thickness + 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
  }

  hitTest(px: number, py: number): boolean {
    const pts = this.points;
    const threshold = this.thickness / 2 + HIT_THRESHOLD_PADDING;

    for (let i = 0; i < pts.length - 1; i++) {
      const dist = pointToLineDistance(px, py, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
      if (dist <= threshold) return true;
    }
    return false;
  }

  /**
   * Recalculates bounding box from the wall's points.
   */
  recalculateBounds(): void {
    const bounds = getBoundingBox(this.points);
    const half = this.thickness / 2;
    this.x = bounds.x - half;
    this.y = bounds.y - half;
    this.width = Math.max(bounds.width + this.thickness, this.thickness);
    this.height = Math.max(bounds.height + this.thickness, this.thickness);
  }

  override toData(): ElementData {
    this.recalculateBounds();
    return super.toData();
  }
}
