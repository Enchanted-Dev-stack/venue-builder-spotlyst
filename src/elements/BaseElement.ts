import { ElementData, ElementType, Point } from '../core/types';
import { generateId } from '../utils/uuid';

export abstract class BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  groupId?: string;
  metadata: Record<string, any>;

  constructor(data: Partial<ElementData> & { type: ElementType }) {
    this.id = data.id || generateId();
    this.type = data.type;
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.width = data.width || 60;
    this.height = data.height || 60;
    this.rotation = data.rotation || 0;
    this.groupId = data.groupId;
    this.metadata = data.metadata || {};
  }

  abstract draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void;
  abstract hitTest(px: number, py: number): boolean;

  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  moveTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  moveBy(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  resize(width: number, height: number): void {
    this.width = Math.max(10, width);
    this.height = Math.max(10, height);
  }

  toData(): ElementData {
    return {
      id: this.id,
      type: this.type,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: this.rotation,
      groupId: this.groupId,
      metadata: { ...this.metadata },
    };
  }

  updateFromData(data: Partial<ElementData>): void {
    if (data.x !== undefined) this.x = data.x;
    if (data.y !== undefined) this.y = data.y;
    if (data.width !== undefined) this.width = data.width;
    if (data.height !== undefined) this.height = data.height;
    if (data.rotation !== undefined) this.rotation = data.rotation;
    if (data.groupId !== undefined) this.groupId = data.groupId;
    if (data.metadata) this.metadata = { ...this.metadata, ...data.metadata };
  }

  /**
   * Helper: applies the element's rotation transform around its center,
   * executes the callback, then restores the context.
   */
  protected withRotation(ctx: CanvasRenderingContext2D, fn: () => void): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.save();
    if (this.rotation !== 0) {
      ctx.translate(cx, cy);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }
    fn();
    ctx.restore();
  }

  /**
   * Helper: draws selection / hover outlines around the element's bounding box.
   */
  protected drawSelectionOutline(
    ctx: CanvasRenderingContext2D,
    isSelected: boolean,
    isHovered: boolean,
  ): void {
    if (!isSelected && !isHovered) return;

    const pad = 4;
    const x = this.x - pad;
    const y = this.y - pad;
    const w = this.width + pad * 2;
    const h = this.height + pad * 2;

    ctx.strokeStyle = isSelected ? '#4F46E5' : '#818CF8';
    ctx.lineWidth = isSelected ? 2 : 1.5;
    ctx.setLineDash(isHovered && !isSelected ? [4, 4] : []);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
