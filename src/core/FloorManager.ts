import { FloorData, FloorAreaType, ElementData, GroupData } from './types';
import { generateId } from '../utils/uuid';

/**
 * Manages multiple floors / areas within a venue.
 *
 * Each floor holds its own independent set of elements and groups.
 * Only one floor is "active" at any given time — the VenueBuilder canvas
 * shows the active floor's content.
 *
 * When switching floors the caller is responsible for snapshotting the
 * current canvas state into the outgoing floor (`saveFloorState`) and
 * restoring the incoming floor's data into the canvas managers.
 */
export class FloorManager {
  private floors: Map<string, FloorData> = new Map();
  private activeFloorId: string = '';

  // ── CRUD ──────────────────────────────────────────────────────────────

  /**
   * Create a new floor / area and return it.
   * If no floors exist yet the new floor automatically becomes active.
   */
  createFloor(name: string, type: FloorAreaType = 'floor'): FloorData {
    const floor: FloorData = {
      id: generateId(),
      name,
      type,
      order: this.floors.size,
      elements: [],
      groups: [],
    };
    this.floors.set(floor.id, floor);

    if (this.floors.size === 1) {
      this.activeFloorId = floor.id;
    }

    return floor;
  }

  removeFloor(floorId: string): boolean {
    if (!this.floors.has(floorId)) return false;
    if (this.floors.size <= 1) return false; // must keep at least one floor

    this.floors.delete(floorId);

    // Re-index order values
    let i = 0;
    for (const f of this.getOrderedFloors()) {
      f.order = i++;
    }

    // If the removed floor was active, switch to the first remaining floor
    if (this.activeFloorId === floorId) {
      this.activeFloorId = this.getOrderedFloors()[0].id;
    }

    return true;
  }

  renameFloor(floorId: string, name: string): void {
    const floor = this.floors.get(floorId);
    if (floor) floor.name = name;
  }

  changeFloorType(floorId: string, type: FloorAreaType): void {
    const floor = this.floors.get(floorId);
    if (floor) floor.type = type;
  }

  reorderFloor(floorId: string, newOrder: number): void {
    const ordered = this.getOrderedFloors();
    const idx = ordered.findIndex(f => f.id === floorId);
    if (idx === -1) return;
    const [moved] = ordered.splice(idx, 1);
    ordered.splice(Math.max(0, Math.min(newOrder, ordered.length)), 0, moved);
    ordered.forEach((f, i) => { f.order = i; });
  }

  // ── Getters ───────────────────────────────────────────────────────────

  getFloor(id: string): FloorData | undefined {
    return this.floors.get(id);
  }

  getActiveFloorId(): string {
    return this.activeFloorId;
  }

  getActiveFloor(): FloorData | undefined {
    return this.floors.get(this.activeFloorId);
  }

  /** Return all floors sorted by their `order` field. */
  getOrderedFloors(): FloorData[] {
    return Array.from(this.floors.values()).sort((a, b) => a.order - b.order);
  }

  getFloorCount(): number {
    return this.floors.size;
  }

  // ── Floor switching ───────────────────────────────────────────────────

  /**
   * Persist the current canvas state (elements + groups) into the
   * currently-active floor so it isn't lost when we switch away.
   */
  saveFloorState(elements: ElementData[], groups: GroupData[]): void {
    const floor = this.floors.get(this.activeFloorId);
    if (!floor) return;
    floor.elements = elements.map(el => ({ ...el, metadata: { ...el.metadata } }));
    floor.groups = groups.map(g => ({ ...g, elementIds: [...g.elementIds], metadata: { ...g.metadata } }));
  }

  /**
   * Switch the active floor. Returns the new floor's data so the caller
   * can load it into the canvas managers.
   *
   * **Important:** call `saveFloorState` for the *outgoing* floor before
   * calling this method.
   */
  switchFloor(floorId: string): FloorData | undefined {
    if (!this.floors.has(floorId)) return undefined;
    this.activeFloorId = floorId;
    return this.floors.get(floorId);
  }

  // ── Serialisation ─────────────────────────────────────────────────────

  clear(): void {
    this.floors.clear();
    this.activeFloorId = '';
  }

  toData(): { floors: FloorData[]; activeFloorId: string } {
    return {
      floors: this.getOrderedFloors().map(f => ({
        ...f,
        elements: f.elements.map(el => ({ ...el, metadata: { ...el.metadata } })),
        groups: f.groups.map(g => ({ ...g, elementIds: [...g.elementIds], metadata: { ...g.metadata } })),
      })),
      activeFloorId: this.activeFloorId,
    };
  }

  loadFromData(floors: FloorData[], activeFloorId?: string): void {
    this.clear();
    for (const f of floors) {
      const floor: FloorData = {
        ...f,
        elements: (f.elements || []).map(el => ({ ...el, metadata: { ...el.metadata } })),
        groups: (f.groups || []).map(g => ({ ...g, elementIds: [...g.elementIds], metadata: { ...g.metadata } })),
      };
      this.floors.set(floor.id, floor);
    }
    if (activeFloorId && this.floors.has(activeFloorId)) {
      this.activeFloorId = activeFloorId;
    } else if (this.floors.size > 0) {
      this.activeFloorId = this.getOrderedFloors()[0].id;
    }
  }
}
