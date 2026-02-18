import { ElementData } from '../core/types';
import { BaseElement } from './BaseElement';
export declare class WallElement extends BaseElement {
    constructor(data?: Partial<ElementData>);
    private get points();
    private get thickness();
    draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void;
    hitTest(px: number, py: number): boolean;
    /**
     * Recalculates bounding box from the wall's points.
     */
    recalculateBounds(): void;
    toData(): ElementData;
}
