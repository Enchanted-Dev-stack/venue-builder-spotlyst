import { ElementData } from '../core/types';
import { BaseElement } from './BaseElement';
export declare class ChairElement extends BaseElement {
    constructor(data?: Partial<ElementData>);
    /**
     * Draws the chair. An optional `statusColor` override can be passed via
     * metadata._statusColor when the chair inherits its group's status.
     */
    draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void;
    hitTest(px: number, py: number): boolean;
}
