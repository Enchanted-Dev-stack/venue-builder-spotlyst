export type ElementType = 'table' | 'chair' | 'wall' | 'door' | 'window';
export type TableShape = 'rectangle' | 'round';
export type BookingStatus = 'available' | 'reserved' | 'occupied' | 'blocked';
export type ToolType = 'select' | 'addTable' | 'addChair' | 'addWall' | 'addDoor' | 'addWindow';

export interface Point {
  x: number;
  y: number;
}

export interface ElementData {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  groupId?: string;
  metadata: Record<string, any>;
}

export interface TableData extends ElementData {
  type: 'table';
  metadata: {
    shape: TableShape;
    tableNumber?: number;
    capacity?: number;
    status: BookingStatus;
    label?: string;
    reservationId?: string;
    timeSlot?: string;
    [key: string]: any;
  };
}

export interface WallData extends ElementData {
  type: 'wall';
  metadata: {
    points: Point[];
    thickness: number;
    [key: string]: any;
  };
}

export interface ChairData extends ElementData {
  type: 'chair';
  metadata: {
    label?: string;
    [key: string]: any;
  };
}

export interface DoorData extends ElementData {
  type: 'door';
  metadata: {
    label?: string;
    [key: string]: any;
  };
}

export interface WindowData extends ElementData {
  type: 'window';
  metadata: {
    label?: string;
    [key: string]: any;
  };
}

export interface GroupData {
  id: string;
  elementIds: string[];
  metadata: {
    tableNumber?: number;
    capacity?: number;
    status: BookingStatus;
    label?: string;
    reservationId?: string;
    timeSlot?: string;
    [key: string]: any;
  };
}

export interface LayoutData {
  version: string;
  canvas: {
    width: number;
    height: number;
    gridSize: number;
  };
  elements: ElementData[];
  groups: GroupData[];
}

export interface VenueBuilderOptions {
  width?: number;
  height?: number;
  gridSize?: number;
  mode?: 'edit' | 'view';
  showGrid?: boolean;
  snapToGrid?: boolean;
}

export interface BuilderEvent {
  elementSelected: { element: ElementData | null; group?: GroupData };
  elementAdded: { element: ElementData };
  elementRemoved: { element: ElementData };
  elementUpdated: { element: ElementData; changes: Partial<ElementData> };
  layoutChanged: { layout: LayoutData };
  toolChanged: { tool: ToolType };
  groupCreated: { group: GroupData };
  groupRemoved: { group: GroupData };
}
