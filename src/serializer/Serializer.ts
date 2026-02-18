import { LayoutData, ElementData, GroupData } from '../core/types';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, DEFAULT_GRID_SIZE } from '../utils/constants';

export class Serializer {
  static readonly VERSION = '1.0';

  static serialize(elements: ElementData[], groups: GroupData[], canvas: { width: number; height: number; gridSize: number }): LayoutData {
    return {
      version: Serializer.VERSION,
      canvas: { ...canvas },
      elements: elements.map(el => ({ ...el, metadata: { ...el.metadata } })),
      groups: groups.map(g => ({ ...g, elementIds: [...g.elementIds], metadata: { ...g.metadata } })),
    };
  }

  static deserialize(data: LayoutData): { elements: ElementData[]; groups: GroupData[]; canvas: { width: number; height: number; gridSize: number } } {
    // Validate version
    if (!data.version) throw new Error('Invalid layout data: missing version');
    return {
      canvas: data.canvas || { width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT, gridSize: DEFAULT_GRID_SIZE },
      elements: (data.elements || []).map(el => ({ ...el, metadata: { ...el.metadata } })),
      groups: (data.groups || []).map(g => ({ ...g, elementIds: [...g.elementIds], metadata: { ...g.metadata } })),
    };
  }

  static toJSON(elements: ElementData[], groups: GroupData[], canvas: { width: number; height: number; gridSize: number }): string {
    return JSON.stringify(Serializer.serialize(elements, groups, canvas), null, 2);
  }

  static fromJSON(json: string): { elements: ElementData[]; groups: GroupData[]; canvas: { width: number; height: number; gridSize: number } } {
    return Serializer.deserialize(JSON.parse(json));
  }
}
