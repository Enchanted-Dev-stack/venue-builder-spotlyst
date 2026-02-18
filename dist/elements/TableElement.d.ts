import { ElementData } from '../core/types';
import { BaseElement } from './BaseElement';
export declare class TableElement extends BaseElement {
    constructor(data?: Partial<ElementData>);
    private getStatusColors;
    draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void;
    hitTest(px: number, py: number): boolean;
}
