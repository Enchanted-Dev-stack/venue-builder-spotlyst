import { BaseElement } from '../elements/BaseElement';
import { ElementData } from './types';
/**
 * Owns the authoritative collection of every element currently on the canvas.
 *
 * Elements are stored in insertion order inside a `Map` keyed by their unique
 * id.  This gives O(1) lookups while preserving draw-order (first inserted
 * draws first, i.e. is at the bottom of the z-stack).
 */
export declare class ElementManager {
    private elements;
    constructor();
    /** Add an element (or replace one with the same id). */
    add(element: BaseElement): void;
    /** Remove an element by id.  Returns the removed element, or `undefined`. */
    remove(id: string): BaseElement | undefined;
    /** Retrieve a single element by id. */
    get(id: string): BaseElement | undefined;
    /** Return every element in insertion (draw) order. */
    getAll(): BaseElement[];
    /** Return all elements of a given type. */
    getByType(type: string): BaseElement[];
    /**
     * Hit-test all elements in reverse insertion order (top-most first) and
     * return the first element whose `hitTest` method returns `true`, or `null`
     * if nothing was hit.
     */
    hitTest(worldX: number, worldY: number): BaseElement | null;
    /** Remove every element. */
    clear(): void;
    /**
     * Convenience wrapper around the `createElement` factory.  Accepts a
     * partial data object (must include `type`) and returns the fully
     * initialised element *after* adding it to the internal collection.
     */
    createFromData(data: Partial<ElementData> & {
        type: string;
    }): BaseElement;
    /** Serialise every element into plain data objects. */
    toData(): ElementData[];
    /**
     * Replace the entire element collection with elements deserialised from an
     * array of `ElementData`.
     */
    loadFromData(data: ElementData[]): void;
}
