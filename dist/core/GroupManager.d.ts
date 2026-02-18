import { GroupData, BookingStatus } from './types';
import { BaseElement } from '../elements/BaseElement';
/**
 * Manages logical groups of canvas elements.  A group typically represents a
 * bookable entity – e.g. a table together with its surrounding chairs – and
 * carries its own booking-status metadata.
 */
export declare class GroupManager {
    private groups;
    constructor();
    /**
     * Create a new group from the supplied elements.
     * Sets `groupId` on each element and stores the group data.
     */
    createGroup(elements: BaseElement[]): GroupData;
    /**
     * Remove a group and clear the `groupId` reference on its member elements.
     */
    removeGroup(groupId: string, elements: BaseElement[]): void;
    getGroup(id: string): GroupData | undefined;
    /** Find the group that contains a given element (if any). */
    getGroupForElement(elementId: string): GroupData | undefined;
    getAllGroups(): GroupData[];
    /** Return the concrete element instances that belong to a group. */
    getGroupElements(groupId: string, allElements: BaseElement[]): BaseElement[];
    updateGroupStatus(groupId: string, status: BookingStatus): void;
    updateGroupMetadata(groupId: string, metadata: Partial<GroupData['metadata']>): void;
    clear(): void;
    toData(): GroupData[];
    loadFromData(data: GroupData[]): void;
    /**
     * Draw a subtle dashed outline around the combined bounding box of every
     * group's member elements.
     */
    drawGroupOutlines(ctx: CanvasRenderingContext2D, allElements: BaseElement[]): void;
}
