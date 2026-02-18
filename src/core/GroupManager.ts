import { GroupData, BookingStatus } from './types';
import { BaseElement } from '../elements/BaseElement';
import { generateId } from '../utils/uuid';
import { COLORS } from '../theme/colors';

/**
 * Manages logical groups of canvas elements.  A group typically represents a
 * bookable entity – e.g. a table together with its surrounding chairs – and
 * carries its own booking-status metadata.
 */
export class GroupManager {
  private groups: Map<string, GroupData>;

  constructor() {
    this.groups = new Map();
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  /**
   * Create a new group from the supplied elements.
   * Sets `groupId` on each element and stores the group data.
   */
  createGroup(elements: BaseElement[]): GroupData {
    const group: GroupData = {
      id: generateId(),
      elementIds: elements.map((el) => el.id),
      metadata: {
        status: 'available' as BookingStatus,
      },
    };

    // Mark every element as belonging to this group.
    for (const el of elements) {
      el.groupId = group.id;
    }

    this.groups.set(group.id, group);
    return group;
  }

  /**
   * Remove a group and clear the `groupId` reference on its member elements.
   */
  removeGroup(groupId: string, elements: BaseElement[]): void {
    const group = this.groups.get(groupId);
    if (!group) return;

    const idSet = new Set(group.elementIds);
    for (const el of elements) {
      if (idSet.has(el.id)) {
        el.groupId = undefined;
      }
    }

    this.groups.delete(groupId);
  }

  getGroup(id: string): GroupData | undefined {
    return this.groups.get(id);
  }

  /** Find the group that contains a given element (if any). */
  getGroupForElement(elementId: string): GroupData | undefined {
    for (const group of this.groups.values()) {
      if (group.elementIds.includes(elementId)) {
        return group;
      }
    }
    return undefined;
  }

  getAllGroups(): GroupData[] {
    return Array.from(this.groups.values());
  }

  /** Return the concrete element instances that belong to a group. */
  getGroupElements(groupId: string, allElements: BaseElement[]): BaseElement[] {
    const group = this.groups.get(groupId);
    if (!group) return [];

    const idSet = new Set(group.elementIds);
    return allElements.filter((el) => idSet.has(el.id));
  }

  // ── Metadata helpers ──────────────────────────────────────────────────────

  updateGroupStatus(groupId: string, status: BookingStatus): void {
    const group = this.groups.get(groupId);
    if (group) {
      group.metadata.status = status;
    }
  }

  updateGroupMetadata(groupId: string, metadata: Partial<GroupData['metadata']>): void {
    const group = this.groups.get(groupId);
    if (group) {
      group.metadata = { ...group.metadata, ...metadata };
    }
  }

  // ── Serialisation ─────────────────────────────────────────────────────────

  clear(): void {
    this.groups.clear();
  }

  toData(): GroupData[] {
    return Array.from(this.groups.values()).map((g) => ({
      ...g,
      elementIds: [...g.elementIds],
      metadata: { ...g.metadata },
    }));
  }

  loadFromData(data: GroupData[]): void {
    this.clear();
    for (const g of data) {
      this.groups.set(g.id, {
        ...g,
        elementIds: [...g.elementIds],
        metadata: { ...g.metadata },
      });
    }
  }

  // ── Drawing ───────────────────────────────────────────────────────────────

  /**
   * Draw a subtle dashed outline around the combined bounding box of every
   * group's member elements.
   */
  drawGroupOutlines(ctx: CanvasRenderingContext2D, allElements: BaseElement[]): void {
    const padding = 8;

    for (const group of this.groups.values()) {
      const members = this.getGroupElements(group.id, allElements);
      if (members.length === 0) continue;

      // Compute the union bounding box.
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      for (const el of members) {
        const b = el.getBounds();
        if (b.x < minX) minX = b.x;
        if (b.y < minY) minY = b.y;
        if (b.x + b.width > maxX) maxX = b.x + b.width;
        if (b.y + b.height > maxY) maxY = b.y + b.height;
      }

      const x = minX - padding;
      const y = minY - padding;
      const w = maxX - minX + padding * 2;
      const h = maxY - minY + padding * 2;

      ctx.save();
      ctx.strokeStyle = COLORS.group.outline;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.45;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }
}
