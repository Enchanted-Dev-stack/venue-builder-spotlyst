import { LayoutData, ElementData, GroupData, FloorData } from '../core/types';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, DEFAULT_GRID_SIZE } from '../utils/constants';

export class Serializer {
  static readonly VERSION = '1.1';

  static serialize(
    elements: ElementData[],
    groups: GroupData[],
    canvas: { width: number; height: number; gridSize: number },
    floors?: FloorData[],
    activeFloorId?: string,
  ): LayoutData {
    const data: LayoutData = {
      version: Serializer.VERSION,
      canvas: { ...canvas },
      elements: elements.map(el => ({ ...el, metadata: { ...el.metadata } })),
      groups: groups.map(g => ({ ...g, elementIds: [...g.elementIds], metadata: { ...g.metadata } })),
    };

    if (floors && floors.length > 0) {
      data.floors = floors.map(f => ({
        ...f,
        elements: f.elements.map(el => ({ ...el, metadata: { ...el.metadata } })),
        groups: f.groups.map(g => ({ ...g, elementIds: [...g.elementIds], metadata: { ...g.metadata } })),
      }));
      data.activeFloorId = activeFloorId;
    }

    return data;
  }

  static deserialize(data: LayoutData): {
    elements: ElementData[];
    groups: GroupData[];
    canvas: { width: number; height: number; gridSize: number };
    floors?: FloorData[];
    activeFloorId?: string;
  } {
    if (!data.version) throw new Error('Invalid layout data: missing version');

    const result: ReturnType<typeof Serializer.deserialize> = {
      canvas: data.canvas || { width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT, gridSize: DEFAULT_GRID_SIZE },
      elements: (data.elements || []).map(el => ({ ...el, metadata: { ...el.metadata } })),
      groups: (data.groups || []).map(g => ({ ...g, elementIds: [...g.elementIds], metadata: { ...g.metadata } })),
    };

    if (data.floors && data.floors.length > 0) {
      result.floors = data.floors.map(f => ({
        ...f,
        elements: (f.elements || []).map(el => ({ ...el, metadata: { ...el.metadata } })),
        groups: (f.groups || []).map(g => ({ ...g, elementIds: [...g.elementIds], metadata: { ...g.metadata } })),
      }));
      result.activeFloorId = data.activeFloorId;
    }

    return result;
  }

  static toJSON(
    elements: ElementData[],
    groups: GroupData[],
    canvas: { width: number; height: number; gridSize: number },
    floors?: FloorData[],
    activeFloorId?: string,
  ): string {
    return JSON.stringify(Serializer.serialize(elements, groups, canvas, floors, activeFloorId), null, 2);
  }

  static fromJSON(json: string): ReturnType<typeof Serializer.deserialize> {
    return Serializer.deserialize(JSON.parse(json));
  }
}
