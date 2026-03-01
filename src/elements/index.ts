import { BaseElement } from './BaseElement';
import { TableElement } from './TableElement';
import { ChairElement } from './ChairElement';
import { WallElement } from './WallElement';
import { DoorElement } from './DoorElement';
import { WindowElement } from './WindowElement';
import { PlantElement } from './PlantElement';
import { CounterElement } from './CounterElement';
import { BoothElement } from './BoothElement';
import { DividerElement } from './DividerElement';
import { BarElement } from './BarElement';
import { LampElement } from './LampElement';
import { ElementData } from '../core/types';

export {
  BaseElement,
  TableElement,
  ChairElement,
  WallElement,
  DoorElement,
  WindowElement,
  PlantElement,
  CounterElement,
  BoothElement,
  DividerElement,
  BarElement,
  LampElement,
};

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
    case 'plant':
      return new PlantElement(data);
    case 'counter':
      return new CounterElement(data);
    case 'booth':
      return new BoothElement(data);
    case 'divider':
      return new DividerElement(data);
    case 'bar':
      return new BarElement(data);
    case 'lamp':
      return new LampElement(data);
    default:
      throw new Error(`Unknown element type: ${data.type}`);
  }
}
