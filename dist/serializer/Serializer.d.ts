import { LayoutData, ElementData, GroupData } from '../core/types';
export declare class Serializer {
    static readonly VERSION = "1.0";
    static serialize(elements: ElementData[], groups: GroupData[], canvas: {
        width: number;
        height: number;
        gridSize: number;
    }): LayoutData;
    static deserialize(data: LayoutData): {
        elements: ElementData[];
        groups: GroupData[];
        canvas: {
            width: number;
            height: number;
            gridSize: number;
        };
    };
    static toJSON(elements: ElementData[], groups: GroupData[], canvas: {
        width: number;
        height: number;
        gridSize: number;
    }): string;
    static fromJSON(json: string): {
        elements: ElementData[];
        groups: GroupData[];
        canvas: {
            width: number;
            height: number;
            gridSize: number;
        };
    };
}
