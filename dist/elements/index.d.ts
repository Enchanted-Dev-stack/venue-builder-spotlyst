import { BaseElement } from './BaseElement';
import { TableElement } from './TableElement';
import { ChairElement } from './ChairElement';
import { WallElement } from './WallElement';
import { DoorElement } from './DoorElement';
import { WindowElement } from './WindowElement';
import { ElementData } from '../core/types';
export { BaseElement, TableElement, ChairElement, WallElement, DoorElement, WindowElement };
export declare function createElement(data: Partial<ElementData> & {
    type: string;
}): BaseElement;
