import { BaseElement } from './BaseElement';
import { TableElement } from './TableElement';
import { ChairElement } from './ChairElement';
import { WallElement } from './WallElement';
import { DoorElement } from './DoorElement';
import { WindowElement } from './WindowElement';
import { ElementData } from '../core/types';

export { BaseElement, TableElement, ChairElement, WallElement, DoorElement, WindowElement };

export function createElement(data: Partial<ElementData> & { type: string }): BaseElement {
  switch (data.type) {
    case 'table':
      return new TableElement(data);
    case 'chair':
      return new ChairElement(data);
    case 'wall':
      return new WallElement(data);
    case 'door':
      return new DoorElement(data);
    case 'window':
      return new WindowElement(data);
    default:
      throw new Error(`Unknown element type: ${data.type}`);
  }
}
