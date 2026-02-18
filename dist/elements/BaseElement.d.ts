import { ElementData, ElementType } from '../core/types';
export declare abstract class BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    groupId?: string;
    metadata: Record<string, any>;
    constructor(data: Partial<ElementData> & {
        type: ElementType;
    });
    abstract draw(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void;
    abstract hitTest(px: number, py: number): boolean;
    getBounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    moveTo(x: number, y: number): void;
    moveBy(dx: number, dy: number): void;
    resize(width: number, height: number): void;
    toData(): ElementData;
    updateFromData(data: Partial<ElementData>): void;
    /**
     * Helper: applies the element's rotation transform around its center,
     * executes the callback, then restores the context.
     */
    protected withRotation(ctx: CanvasRenderingContext2D, fn: () => void): void;
    /**
     * Helper: draws selection / hover outlines around the element's bounding box.
     */
    protected drawSelectionOutline(ctx: CanvasRenderingContext2D, isSelected: boolean, isHovered: boolean): void;
}
