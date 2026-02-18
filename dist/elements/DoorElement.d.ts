import { ElementData } from '../core/types';
import { BaseElement } from './BaseElement';
export declare class DoorElement extends BaseElement {
    constructor(data?: Partial<ElementData>);
    draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void;
    hitTest(px: number, py: number): boolean;
}
