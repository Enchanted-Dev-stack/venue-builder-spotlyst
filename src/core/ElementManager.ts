import { BaseElement } from '../elements/BaseElement';
import { createElement } from '../elements';
import { ElementData } from './types';

/**
 * Owns the authoritative collection of every element currently on the canvas.
 *
 * Elements are stored in insertion order inside a `Map` keyed by their unique
 * id.  This gives O(1) lookups while preserving draw-order (first inserted
 * draws first, i.e. is at the bottom of the z-stack).
 */
export class ElementManager {
  private elements: Map<string, BaseElement>;

  constructor() {
    this.elements = new Map();
  }

  /** Add an element (or replace one with the same id). */
  add(element: BaseElement): void {
    this.elements.set(element.id, element);
  }

  /** Remove an element by id.  Returns the removed element, or `undefined`. */
  remove(id: string): BaseElement | undefined {
    const element = this.elements.get(id);
    if (element) {
      this.elements.delete(id);
    }
    return element;
  }

  /** Retrieve a single element by id. */
  get(id: string): BaseElement | undefined {
    return this.elements.get(id);
  }

  /** Return every element in insertion (draw) order. */
  getAll(): BaseElement[] {
    return Array.from(this.elements.values());
  }

  /** Return all elements of a given type. */
  getByType(type: string): BaseElement[] {
    return this.getAll().filter((el) => el.type === type);
  }

  /**
   * Hit-test all elements in reverse insertion order (top-most first) and
   * return the first element whose `hitTest` method returns `true`, or `null`
   * if nothing was hit.
   */
  hitTest(worldX: number, worldY: number): BaseElement | null {
    const all = this.getAll();
    for (let i = all.length - 1; i >= 0; i--) {
      if (all[i].hitTest(worldX, worldY)) {
        return all[i];
      }
    }
    return null;
  }

  /** Remove every element. */
  clear(): void {
    this.elements.clear();
  }

  /**
   * Convenience wrapper around the `createElement` factory.  Accepts a
   * partial data object (must include `type`) and returns the fully
   * initialised element *after* adding it to the internal collection.
   */
  createFromData(data: Partial<ElementData> & { type: string }): BaseElement {
    const element = createElement(data);
    this.add(element);
    return element;
  }

  /** Serialise every element into plain data objects. */
  toData(): ElementData[] {
    return this.getAll().map((el) => el.toData());
  }

  /**
   * Replace the entire element collection with elements deserialised from an
   * array of `ElementData`.
   */
  loadFromData(data: ElementData[]): void {
    this.clear();
    for (const d of data) {
      const element = createElement(d);
      this.add(element);
    }
  }
}
