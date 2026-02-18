# venue-builder — API Reference

> **venue-builder** is a zero-dependency TypeScript Canvas 2D venue floor-plan builder.
> Design interactive seating charts, floor plans, and venue layouts right in the browser.

[![npm](https://img.shields.io/npm/v/venue-builder)](https://www.npmjs.com/package/venue-builder)
[![license](https://img.shields.io/npm/l/venue-builder)](./LICENSE)

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Constructor](#constructor)
  - [VenueBuilderOptions](#venuebuilderoptions)
  - [ThemeConfig](#themeconfig)
- [Types](#types)
  - [ElementType](#elementtype)
  - [ElementConfig](#elementconfig)
  - [Element](#element)
  - [Group](#group)
  - [GroupMetadata](#groupmetadata)
  - [VenueLayoutJSON](#venuelayoutjson)
- [Element CRUD](#element-crud)
  - [addElement()](#addelementconfig-elementconfig-string)
  - [removeElement()](#removeelementid-string-void)
  - [updateElement()](#updateelementid-string-updates-partialelementconfig-void)
  - [getElementById()](#getelementbyidid-string-element--undefined)
  - [getElements()](#getelements-element)
  - [getElementsByType()](#getelementsbytypetype-elementtype-element)
- [Grouping](#grouping)
  - [groupElements()](#groupelementselementids-string-string)
  - [ungroupElements()](#ungroupelementsgroupid-string-void)
  - [getGroup()](#getgroupgroupid-string-group--undefined)
  - [getGroups()](#getgroups-group)
  - [updateGroup()](#updategroupgroupid-string-updates-partialgroupmetadata-void)
- [Tool Management](#tool-management)
  - [setTool()](#settooltool-string-void)
  - [getTool()](#gettool-string)
- [Serialization](#serialization)
  - [toJSON()](#tojson-venuelayoutjson)
  - [loadJSON()](#loadjsondata-venuelayoutjson-void)
  - [clear()](#clear-void)
- [History (Undo / Redo)](#history-undo--redo)
  - [undo()](#undo-void)
  - [redo()](#redo-void)
  - [canUndo()](#canundo-boolean)
  - [canRedo()](#canredo-boolean)
- [Camera / Viewport](#camera--viewport)
  - [zoomIn()](#zoomin-void)
  - [zoomOut()](#zoomout-void)
  - [zoomToFit()](#zoomtofit-void)
  - [setZoom()](#setzoomlevel-number-void)
  - [getZoom()](#getzoom-number)
  - [panTo()](#pantox-number-y-number-void)
- [Events](#events)
  - [on()](#onevent-string-callback-function-void)
  - [off()](#offevent-string-callback-function-void)
  - [Event Reference](#event-reference)
- [Lifecycle](#lifecycle)
  - [destroy()](#destroy-void)
- [Integration Examples](#integration-examples)
  - [Plain HTML](#plain-html)
  - [React](#react)
  - [Vue 3 (Composition API)](#vue-3-composition-api)
  - [Svelte](#svelte)
- [FAQ](#faq)

---

## Installation

```bash
# npm
npm install venue-builder

# yarn
yarn add venue-builder

# pnpm
pnpm add venue-builder
```

Or include the UMD bundle directly via a `<script>` tag:

```html
<script src="https://unpkg.com/venue-builder/dist/venue-builder.umd.js"></script>
```

---

## Quick Start

```typescript
import { VenueBuilder } from 'venue-builder';

const container = document.getElementById('venue')!;
const builder = new VenueBuilder(container, {
  width: 1200,
  height: 800,
  snapToGrid: true,
});

// Add a rectangular table
const tableId = builder.addElement({
  type: 'table',
  x: 200,
  y: 150,
  width: 120,
  height: 60,
  label: 'Table 1',
  status: 'available',
});

// Listen for selection
builder.on('elementSelected', ({ element }) => {
  console.log('Selected:', element.label);
});

// Export the layout
const layout = builder.toJSON();
```

---

## Constructor

```typescript
const builder = new VenueBuilder(container: HTMLElement, options?: VenueBuilderOptions);
```

Creates a new `VenueBuilder` instance and attaches a `<canvas>` element to the provided DOM container.

| Parameter   | Type                  | Required | Description                                                                 |
| ----------- | --------------------- | -------- | --------------------------------------------------------------------------- |
| `container` | `HTMLElement`         | ✅       | The DOM element that will host the canvas. Must already be in the document. |
| `options`   | `VenueBuilderOptions` | ❌       | Optional configuration. See below.                                          |

**Example**

```typescript
const el = document.getElementById('my-venue')!;

// Minimal — all defaults
const builder = new VenueBuilder(el);

// Custom size + read-only viewer
const viewer = new VenueBuilder(el, {
  width: 1600,
  height: 900,
  readOnly: true,
  showGrid: false,
});
```

> **Note:** If the container is removed from the DOM, call [`destroy()`](#destroy-void) first to avoid memory leaks.

---

### VenueBuilderOptions

```typescript
interface VenueBuilderOptions {
  width?: number;
  height?: number;
  gridSize?: number;
  snapToGrid?: boolean;
  readOnly?: boolean;
  showGrid?: boolean;
  showStatusColors?: boolean;
  theme?: Partial<ThemeConfig>;
}
```

| Property           | Type                    | Default  | Description                                                                                              |
| ------------------ | ----------------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `width`            | `number`                | `1200`   | Width of the canvas in pixels.                                                                           |
| `height`           | `number`                | `800`    | Height of the canvas in pixels.                                                                          |
| `gridSize`         | `number`                | `20`     | Size of each grid cell in pixels. Elements snap to multiples of this value when `snapToGrid` is `true`.  |
| `snapToGrid`       | `boolean`               | `true`   | When enabled, elements automatically align to the nearest grid intersection on placement and drag.       |
| `readOnly`         | `boolean`               | `false`  | When `true`, all editing interactions (drag, resize, add, delete) are disabled. Useful for viewer modes. |
| `showGrid`         | `boolean`               | `true`   | Render background grid lines on the canvas.                                                              |
| `showStatusColors` | `boolean`               | `true`   | Colour-code elements based on their `status` property (e.g. green = available, red = booked).            |
| `theme`            | `Partial<ThemeConfig>`  | `{}`     | Override any subset of the default theme colours. See [ThemeConfig](#themeconfig).                        |

---

### ThemeConfig

```typescript
interface ThemeConfig {
  background: string;        // Canvas background colour — default '#ffffff'
  gridLine: string;          // Grid line colour — default '#e0e0e0'
  selectionStroke: string;   // Stroke colour for selected elements — default '#1a73e8'
  selectionFill: string;     // Fill overlay for the selection box — default 'rgba(26,115,232,0.08)'
  statusAvailable: string;   // Colour for 'available' status — default '#4caf50'
  statusBooked: string;      // Colour for 'booked' status — default '#f44336'
  statusReserved: string;    // Colour for 'reserved' status — default '#ff9800'
  statusBlocked: string;     // Colour for 'blocked' status — default '#9e9e9e'
  wallFill: string;          // Default wall fill — default '#424242'
  doorFill: string;          // Default door fill — default '#8d6e63'
  windowFill: string;        // Default window fill — default '#90caf9'
  labelColor: string;        // Text colour for element labels — default '#212121'
  labelFont: string;         // CSS font string for labels — default '12px sans-serif'
}
```

**Example — dark theme overrides**

```typescript
const builder = new VenueBuilder(container, {
  theme: {
    background: '#1e1e1e',
    gridLine: '#333333',
    labelColor: '#eeeeee',
    selectionStroke: '#bb86fc',
  },
});
```

---

## Types

### ElementType

```typescript
type ElementType =
  | 'table'        // Rectangular table
  | 'roundTable'   // Circular table
  | 'chair'        // Individual chair / seat
  | 'wall'         // Wall segment
  | 'door'         // Door opening
  | 'window';      // Window segment
```

---

### ElementConfig

The object you pass when creating or updating an element.

```typescript
interface ElementConfig {
  type: ElementType;
  x: number;               // X position (px, relative to canvas origin)
  y: number;               // Y position (px, relative to canvas origin)
  width?: number;          // Width in px (ignored for roundTable — use radius)
  height?: number;         // Height in px (ignored for roundTable — use radius)
  radius?: number;         // Radius in px (roundTable & chair only)
  rotation?: number;       // Rotation in degrees (0–360), default 0
  label?: string;          // Display label drawn on the element
  status?: 'available' | 'booked' | 'reserved' | 'blocked'; // Booking status, default 'available'
  capacity?: number;       // Seat capacity (tables only)
  metadata?: Record<string, unknown>; // Arbitrary user data (e.g. price tier, zone)
}
```

---

### Element

The runtime representation returned by getter methods. Extends `ElementConfig` with an immutable `id`.

```typescript
interface Element extends ElementConfig {
  readonly id: string;     // Unique identifier (UUID v4)
}
```

---

### Group

```typescript
interface Group {
  readonly id: string;             // Unique group identifier
  readonly elementIds: string[];   // IDs of elements in this group
  label?: string;
  status?: 'available' | 'booked' | 'reserved' | 'blocked';
  metadata?: Record<string, unknown>;
}
```

---

### GroupMetadata

```typescript
interface GroupMetadata {
  label?: string;
  status?: 'available' | 'booked' | 'reserved' | 'blocked';
  metadata?: Record<string, unknown>;
}
```

---

### VenueLayoutJSON

The serialised format produced by [`toJSON()`](#tojson-venuelayoutjson) and consumed by [`loadJSON()`](#loadjsondata-venuelayoutjson-void).

```typescript
interface VenueLayoutJSON {
  version: string;                   // Schema version (e.g. "1.0.0")
  options: VenueBuilderOptions;      // Builder options at time of export
  elements: ElementConfig[];         // All elements with their IDs
  groups: Group[];                   // All groups
}
```

---

## Element CRUD

### `addElement(config: ElementConfig): string`

Adds a new element to the canvas and returns its unique ID.

| Parameter | Type            | Required | Description               |
| --------- | --------------- | -------- | ------------------------- |
| `config`  | `ElementConfig` | ✅       | Shape, position and data. |

**Returns** — `string` — The auto-generated unique element ID.

**Throws** — `Error` if `type` is invalid or required positional fields (`x`, `y`) are missing.

```typescript
// Rectangular table
const t1 = builder.addElement({
  type: 'table',
  x: 100,
  y: 100,
  width: 140,
  height: 70,
  label: 'VIP-1',
  status: 'reserved',
  capacity: 6,
});

// Round table
const t2 = builder.addElement({
  type: 'roundTable',
  x: 400,
  y: 300,
  radius: 50,
  label: 'Table 12',
  capacity: 8,
});

// Wall segment
builder.addElement({
  type: 'wall',
  x: 0,
  y: 0,
  width: 800,
  height: 10,
});

// Chair
builder.addElement({
  type: 'chair',
  x: 120,
  y: 200,
  radius: 12,
  label: 'A1',
});
```

---

### `removeElement(id: string): void`

Removes an element from the canvas. If the element belongs to a group, it is automatically removed from that group. If the group becomes empty, it is also removed.

| Parameter | Type     | Required | Description                    |
| --------- | -------- | -------- | ------------------------------ |
| `id`      | `string` | ✅       | The element ID to remove.      |

**Throws** — `Error` if no element with the given `id` exists.

```typescript
builder.removeElement(t1);
```

---

### `updateElement(id: string, updates: Partial<ElementConfig>): void`

Applies a partial update to an existing element. Only the provided fields are changed; all others remain as-is.

| Parameter | Type                      | Required | Description                              |
| --------- | ------------------------- | -------- | ---------------------------------------- |
| `id`      | `string`                  | ✅       | The element ID to update.                |
| `updates` | `Partial<ElementConfig>`  | ✅       | Fields to merge into the element config. |

**Throws** — `Error` if no element with the given `id` exists.

```typescript
// Move a table
builder.updateElement(t1, { x: 300, y: 200 });

// Change booking status
builder.updateElement(t1, { status: 'booked' });

// Rename + attach metadata
builder.updateElement(t1, {
  label: 'Premium Table 1',
  metadata: { priceTier: 'gold', zone: 'A' },
});
```

---

### `getElementById(id: string): Element | undefined`

Returns a single element by ID, or `undefined` if not found.

| Parameter | Type     | Required | Description       |
| --------- | -------- | -------- | ----------------- |
| `id`      | `string` | ✅       | The element ID.   |

**Returns** — `Element | undefined`

```typescript
const el = builder.getElementById(t1);
if (el) {
  console.log(el.label, el.status); // "VIP-1" "reserved"
}
```

---

### `getElements(): Element[]`

Returns an array of **all** elements currently on the canvas. The returned array is a shallow copy — mutating it will not affect the builder state.

**Returns** — `Element[]`

```typescript
const allElements = builder.getElements();
console.log(`Total elements: ${allElements.length}`);
```

---

### `getElementsByType(type: ElementType): Element[]`

Returns all elements that match the specified type.

| Parameter | Type          | Required | Description                |
| --------- | ------------- | -------- | -------------------------- |
| `type`    | `ElementType` | ✅       | The element type to filter by. |

**Returns** — `Element[]`

```typescript
const tables = builder.getElementsByType('table');
const walls  = builder.getElementsByType('wall');

console.log(`Tables: ${tables.length}, Walls: ${walls.length}`);
```

---

## Grouping

Groups allow you to logically associate multiple elements (e.g. a table and its surrounding chairs) so they can be selected, moved, and status-updated together.

### `groupElements(elementIds: string[]): string`

Creates a new group from the given element IDs.

| Parameter    | Type       | Required | Description                          |
| ------------ | ---------- | -------- | ------------------------------------ |
| `elementIds` | `string[]` | ✅       | Array of element IDs to group.       |

**Returns** — `string` — The auto-generated unique group ID.

**Throws**
- `Error` if fewer than 2 element IDs are provided.
- `Error` if any element ID does not exist.
- `Error` if any element already belongs to another group.

```typescript
const chairIds = ['chair-a1', 'chair-a2', 'chair-a3'];
const tableId  = 'table-1';

const groupId = builder.groupElements([tableId, ...chairIds]);
console.log('Created group:', groupId);
```

---

### `ungroupElements(groupId: string): void`

Dissolves a group. The elements remain on the canvas but are no longer associated.

| Parameter | Type     | Required | Description              |
| --------- | -------- | -------- | ------------------------ |
| `groupId` | `string` | ✅       | The group ID to remove.  |

**Throws** — `Error` if no group with the given `groupId` exists.

```typescript
builder.ungroupElements(groupId);
```

---

### `getGroup(groupId: string): Group | undefined`

Returns a single group by ID, or `undefined` if not found.

| Parameter | Type     | Required | Description       |
| --------- | -------- | -------- | ----------------- |
| `groupId` | `string` | ✅       | The group ID.     |

**Returns** — `Group | undefined`

```typescript
const group = builder.getGroup(groupId);
if (group) {
  console.log('Elements in group:', group.elementIds);
}
```

---

### `getGroups(): Group[]`

Returns an array of all groups. The returned array is a shallow copy.

**Returns** — `Group[]`

```typescript
const groups = builder.getGroups();
groups.forEach((g) => {
  console.log(`${g.id}: ${g.elementIds.length} elements`);
});
```

---

### `updateGroup(groupId: string, updates: Partial<GroupMetadata>): void`

Updates metadata on a group. When you update a group's `status`, the status cascades to **all elements** within the group.

| Parameter | Type                       | Required | Description                               |
| --------- | -------------------------- | -------- | ----------------------------------------- |
| `groupId` | `string`                   | ✅       | The group ID to update.                   |
| `updates` | `Partial<GroupMetadata>`   | ✅       | Fields to merge into the group metadata.  |

**Throws** — `Error` if no group with the given `groupId` exists.

```typescript
// Mark an entire table group as booked
builder.updateGroup(groupId, {
  status: 'booked',
  label: 'Section A — Table 1',
  metadata: { bookingRef: 'BK-20240615-001' },
});
```

---

## Tool Management

Tools control what happens when the user interacts with the canvas (click, drag).

### `setTool(tool: string): void`

Sets the currently active tool.

| Parameter | Type     | Required | Description            |
| --------- | -------- | -------- | ---------------------- |
| `tool`    | `string` | ✅       | One of the tool names. |

**Available tools:**

| Tool             | Description                                         |
| ---------------- | --------------------------------------------------- |
| `'select'`       | Default. Click to select, drag to move / resize.    |
| `'addTable'`     | Click or drag on canvas to place a rectangular table.|
| `'addRoundTable'`| Click on canvas to place a round table.             |
| `'addChair'`     | Click on canvas to place a chair / seat.            |
| `'addWall'`      | Click and drag to draw a wall segment.              |
| `'addDoor'`      | Click and drag to place a door opening.             |
| `'addWindow'`    | Click and drag to place a window segment.           |

**Throws** — `Error` if the tool name is invalid.

```typescript
builder.setTool('addTable');

// After placing, switch back to select
builder.on('elementAdded', () => {
  builder.setTool('select');
});
```

---

### `getTool(): string`

Returns the name of the currently active tool.

**Returns** — `string`

```typescript
const current = builder.getTool(); // 'select'
```

---

## Serialization

### `toJSON(): VenueLayoutJSON`

Serialises the entire venue layout — including all elements, groups, and builder options — into a plain JSON-serialisable object. Use this to persist layouts to a database or file.

**Returns** — [`VenueLayoutJSON`](#venuelayoutjson)

```typescript
const layout = builder.toJSON();

// Save to localStorage
localStorage.setItem('venue-draft', JSON.stringify(layout));

// Or POST to your API
await fetch('/api/venues/123/layout', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(layout),
});
```

---

### `loadJSON(data: VenueLayoutJSON): void`

Loads a previously exported layout, replacing all current elements and groups. The canvas is re-rendered automatically.

| Parameter | Type              | Required | Description                    |
| --------- | ----------------- | -------- | ------------------------------ |
| `data`    | `VenueLayoutJSON` | ✅       | A valid venue layout object.   |

**Throws** — `Error` if the data is malformed or the `version` is unsupported.

```typescript
// Load from localStorage
const saved = localStorage.getItem('venue-draft');
if (saved) {
  builder.loadJSON(JSON.parse(saved));
}

// Load from API
const res = await fetch('/api/venues/123/layout');
const layout = await res.json();
builder.loadJSON(layout);
```

---

### `clear(): void`

Removes **all** elements and groups from the canvas and resets the undo/redo history. Builder options and theme are preserved.

```typescript
if (confirm('Clear the entire layout?')) {
  builder.clear();
}
```

---

## History (Undo / Redo)

Every mutating action (add, remove, update, move, resize, group, ungroup) is automatically pushed onto an undo stack. The history stack is cleared when [`clear()`](#clear-void) or [`loadJSON()`](#loadjsondata-venuelayoutjson-void) is called.

### `undo(): void`

Reverts the last action. Does nothing if there is no action to undo.

```typescript
builder.undo();
```

---

### `redo(): void`

Re-applies the last undone action. Does nothing if there is no action to redo.

```typescript
builder.redo();
```

---

### `canUndo(): boolean`

Returns `true` if there is at least one action on the undo stack.

**Returns** — `boolean`

```typescript
undoButton.disabled = !builder.canUndo();
```

---

### `canRedo(): boolean`

Returns `true` if there is at least one action on the redo stack.

**Returns** — `boolean`

```typescript
redoButton.disabled = !builder.canRedo();
```

**Example — wiring up undo/redo buttons**

```typescript
const undoBtn = document.getElementById('undo-btn')!;
const redoBtn = document.getElementById('redo-btn')!;

function refreshButtons() {
  undoBtn.toggleAttribute('disabled', !builder.canUndo());
  redoBtn.toggleAttribute('disabled', !builder.canRedo());
}

undoBtn.addEventListener('click', () => { builder.undo(); refreshButtons(); });
redoBtn.addEventListener('click', () => { builder.redo(); refreshButtons(); });

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    if (e.shiftKey) builder.redo();
    else builder.undo();
    refreshButtons();
  }
});

builder.on('layoutChanged', refreshButtons);
```

---

## Camera / Viewport

All zoom levels are expressed as a multiplier where `1` = 100 %.

### `zoomIn(): void`

Increases zoom by one step (default step: `0.1`). Zoom is centred on the canvas midpoint.

```typescript
builder.zoomIn(); // e.g. 1.0 → 1.1
```

---

### `zoomOut(): void`

Decreases zoom by one step.

```typescript
builder.zoomOut(); // e.g. 1.1 → 1.0
```

---

### `zoomToFit(): void`

Automatically adjusts zoom level and pan offset so that **all elements** are visible within the canvas with a small amount of padding.

```typescript
// After loading a layout, fit it to the viewport
builder.loadJSON(layout);
builder.zoomToFit();
```

---

### `setZoom(level: number): void`

Sets the zoom to an exact level.

| Parameter | Type     | Required | Description                                       |
| --------- | -------- | -------- | ------------------------------------------------- |
| `level`   | `number` | ✅       | Zoom multiplier. Must be between `0.1` and `5.0`. |

**Throws** — `Error` if `level` is outside the allowed range.

```typescript
builder.setZoom(1.5); // 150 %
```

---

### `getZoom(): number`

Returns the current zoom level.

**Returns** — `number`

```typescript
const zoom = builder.getZoom();
zoomLabel.textContent = `${Math.round(zoom * 100)}%`; // "150%"
```

---

### `panTo(x: number, y: number): void`

Pans the viewport so that the given canvas coordinates are centred on screen.

| Parameter | Type     | Required | Description                            |
| --------- | -------- | -------- | -------------------------------------- |
| `x`       | `number` | ✅       | X coordinate in canvas space.          |
| `y`       | `number` | ✅       | Y coordinate in canvas space.          |

```typescript
// Centre the viewport on a specific table
const table = builder.getElementById(tableId);
if (table) {
  builder.panTo(table.x, table.y);
}
```

---

## Events

`VenueBuilder` uses a simple pub/sub event system. Register listeners with `on()` and remove them with `off()`.

### `on(event: string, callback: Function): void`

Subscribes to an event.

| Parameter  | Type       | Required | Description                  |
| ---------- | ---------- | -------- | ---------------------------- |
| `event`    | `string`   | ✅       | Event name (see table below).|
| `callback` | `Function` | ✅       | Handler function.            |

```typescript
builder.on('elementSelected', ({ element, group }) => {
  sidebar.showDetails(element, group);
});
```

---

### `off(event: string, callback: Function): void`

Unsubscribes a previously registered callback. You must pass the **same function reference** that was used in `on()`.

| Parameter  | Type       | Required | Description             |
| ---------- | ---------- | -------- | ----------------------- |
| `event`    | `string`   | ✅       | Event name.             |
| `callback` | `Function` | ✅       | The handler to remove.  |

```typescript
function handleSelection({ element }) {
  console.log('Selected:', element.id);
}

builder.on('elementSelected', handleSelection);

// Later…
builder.off('elementSelected', handleSelection);
```

---

### Event Reference

| Event Name           | Payload                                                       | Fired When                                                          |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `elementSelected`    | `{ element: Element, group?: Group }`                         | An element is selected (click or programmatic).                     |
| `elementDeselected`  | `{}`                                                          | The current selection is cleared.                                   |
| `elementAdded`       | `{ element: Element }`                                        | A new element is added to the canvas.                               |
| `elementRemoved`     | `{ elementId: string }`                                       | An element is removed from the canvas.                              |
| `elementMoved`       | `{ element: Element, oldPosition: {x,y}, newPosition: {x,y} }` | An element's position changes (drag or programmatic update).     |
| `elementResized`     | `{ element: Element, oldSize: {w,h}, newSize: {w,h} }`       | An element's dimensions change (resize handle or update).           |
| `groupCreated`       | `{ group: Group }`                                            | A new group is created via `groupElements()`.                       |
| `groupRemoved`       | `{ groupId: string }`                                         | A group is dissolved via `ungroupElements()`.                       |
| `statusChanged`      | `{ elementOrGroup: Element \| Group, oldStatus: string, newStatus: string }` | The `status` field of an element or group changes.   |
| `layoutChanged`      | `{ layout: VenueLayoutJSON }`                                 | Any mutation occurs (catch-all for syncing / auto-save).            |
| `toolChanged`        | `{ tool: string }`                                            | The active tool changes via `setTool()`.                            |
| `zoomChanged`        | `{ zoom: number }`                                            | The zoom level changes (programmatic or mouse wheel).               |

**Example — auto-save on change**

```typescript
let saveTimeout: ReturnType<typeof setTimeout>;

builder.on('layoutChanged', ({ layout }) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    fetch('/api/venues/123/layout', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(layout),
    });
  }, 500); // debounce 500 ms
});
```

---

## Lifecycle

### `destroy(): void`

Tears down the builder instance:

1. Removes all internal event listeners (pointer, keyboard, wheel, resize).
2. Removes the `<canvas>` element from the DOM.
3. Clears internal state (elements, groups, history).

After calling `destroy()`, the instance should not be used again.

```typescript
builder.destroy();
```

> **Important:** Always call `destroy()` when the host component unmounts (e.g. in React's `useEffect` cleanup or Vue's `onUnmounted`). Failing to do so may cause memory leaks and orphaned event listeners.

---

## Integration Examples

### Plain HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Venue Builder</title>
  <style>
    #builder-container { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="toolbar">
    <button onclick="builder.setTool('select')">Select</button>
    <button onclick="builder.setTool('addTable')">Add Table</button>
    <button onclick="builder.setTool('addRoundTable')">Add Round Table</button>
    <button onclick="builder.setTool('addChair')">Add Chair</button>
    <button onclick="builder.setTool('addWall')">Add Wall</button>
    <button onclick="builder.setTool('addDoor')">Add Door</button>
    <button onclick="builder.setTool('addWindow')">Add Window</button>
    <button onclick="builder.undo()">Undo</button>
    <button onclick="builder.redo()">Redo</button>
    <button onclick="builder.zoomIn()">Zoom In</button>
    <button onclick="builder.zoomOut()">Zoom Out</button>
    <button onclick="builder.zoomToFit()">Fit</button>
  </div>
  <div id="builder-container"></div>

  <script src="https://unpkg.com/venue-builder/dist/venue-builder.umd.js"></script>
  <script>
    const builder = new VenueBuilder(document.getElementById('builder-container'), {
      width: 1200,
      height: 800,
    });

    builder.on('elementSelected', ({ element }) => {
      console.log('Selected:', element);
    });

    builder.on('layoutChanged', ({ layout }) => {
      localStorage.setItem('venue-layout', JSON.stringify(layout));
    });

    // Restore from previous session
    const saved = localStorage.getItem('venue-layout');
    if (saved) {
      builder.loadJSON(JSON.parse(saved));
    }
  </script>
</body>
</html>
```

---

### React

```tsx
import { useEffect, useRef } from 'react';
import { VenueBuilder } from 'venue-builder';
import type { VenueLayoutJSON } from 'venue-builder';

interface LayoutEditorProps {
  initialLayout?: VenueLayoutJSON;
  onSave?: (layout: VenueLayoutJSON) => void;
  readOnly?: boolean;
}

function LayoutEditor({ initialLayout, onSave, readOnly = false }: LayoutEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const builderRef = useRef<VenueBuilder | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const builder = new VenueBuilder(containerRef.current, {
      width: 1200,
      height: 800,
      readOnly,
    });

    if (initialLayout) {
      builder.loadJSON(initialLayout);
      builder.zoomToFit();
    }

    builder.on('layoutChanged', ({ layout }: { layout: VenueLayoutJSON }) => {
      onSave?.(layout);
    });

    builderRef.current = builder;

    return () => {
      builder.destroy();
      builderRef.current = null;
    };
  }, [readOnly]); // re-create when readOnly changes

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => builderRef.current?.setTool('select')}>Select</button>
        <button onClick={() => builderRef.current?.setTool('addTable')}>Add Table</button>
        <button onClick={() => builderRef.current?.setTool('addRoundTable')}>Round Table</button>
        <button onClick={() => builderRef.current?.setTool('addChair')}>Chair</button>
        <button onClick={() => builderRef.current?.setTool('addWall')}>Wall</button>
        <button onClick={() => builderRef.current?.undo()}>Undo</button>
        <button onClick={() => builderRef.current?.redo()}>Redo</button>
        <button onClick={() => builderRef.current?.zoomToFit()}>Fit</button>
      </div>
      <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
    </div>
  );
}

export default LayoutEditor;
```

---

### Vue 3 (Composition API)

```vue
<template>
  <div>
    <div class="toolbar">
      <button @click="setTool('select')">Select</button>
      <button @click="setTool('addTable')">Add Table</button>
      <button @click="setTool('addRoundTable')">Round Table</button>
      <button @click="setTool('addChair')">Chair</button>
      <button @click="setTool('addWall')">Wall</button>
      <button @click="undo">Undo</button>
      <button @click="redo">Redo</button>
      <button @click="zoomToFit">Fit</button>
    </div>
    <div ref="containerRef" style="width: 100%; height: 100vh" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { VenueBuilder } from 'venue-builder';
import type { VenueLayoutJSON } from 'venue-builder';

const props = defineProps<{
  initialLayout?: VenueLayoutJSON;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', layout: VenueLayoutJSON): void;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
let builder: VenueBuilder | null = null;

onMounted(() => {
  if (!containerRef.value) return;

  builder = new VenueBuilder(containerRef.value, {
    width: 1200,
    height: 800,
    readOnly: props.readOnly,
  });

  if (props.initialLayout) {
    builder.loadJSON(props.initialLayout);
    builder.zoomToFit();
  }

  builder.on('layoutChanged', ({ layout }: { layout: VenueLayoutJSON }) => {
    emit('save', layout);
  });
});

onUnmounted(() => {
  builder?.destroy();
  builder = null;
});

const setTool = (tool: string) => builder?.setTool(tool as any);
const undo = () => builder?.undo();
const redo = () => builder?.redo();
const zoomToFit = () => builder?.zoomToFit();
</script>
```

---

### Svelte

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { VenueBuilder } from 'venue-builder';
  import type { VenueLayoutJSON } from 'venue-builder';

  export let initialLayout: VenueLayoutJSON | undefined = undefined;
  export let readOnly = false;

  let container: HTMLDivElement;
  let builder: VenueBuilder | null = null;

  onMount(() => {
    builder = new VenueBuilder(container, {
      width: 1200,
      height: 800,
      readOnly,
    });

    if (initialLayout) {
      builder.loadJSON(initialLayout);
      builder.zoomToFit();
    }

    builder.on('layoutChanged', ({ layout }) => {
      // Dispatch custom event or call a callback
      container.dispatchEvent(new CustomEvent('save', { detail: layout }));
    });
  });

  onDestroy(() => {
    builder?.destroy();
    builder = null;
  });
</script>

<div>
  <div class="toolbar">
    <button on:click={() => builder?.setTool('select')}>Select</button>
    <button on:click={() => builder?.setTool('addTable')}>Add Table</button>
    <button on:click={() => builder?.setTool('addRoundTable')}>Round Table</button>
    <button on:click={() => builder?.undo()}>Undo</button>
    <button on:click={() => builder?.redo()}>Redo</button>
    <button on:click={() => builder?.zoomToFit()}>Fit</button>
  </div>
  <div bind:this={container} style="width: 100%; height: 100vh;" />
</div>
```

---

## FAQ

### Can I use venue-builder in a server-side rendering (SSR) environment?

`VenueBuilder` requires a DOM and the Canvas 2D API. It should only be instantiated on the **client side**. In frameworks like Next.js or Nuxt, guard the import behind a dynamic import or a client-only check:

```typescript
// Next.js
import dynamic from 'next/dynamic';
const LayoutEditor = dynamic(() => import('./LayoutEditor'), { ssr: false });
```

### How do I make the canvas responsive?

Set the container to `width: 100%` and listen for `resize` events to update the canvas size:

```typescript
const observer = new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  builder.setZoom(builder.getZoom()); // triggers internal resize
});
observer.observe(container);
```

Alternatively, call `builder.zoomToFit()` on window resize.

### Is there a maximum number of elements?

There is no hard limit. Performance depends on the user's device and the complexity of each element's rendering. Layouts with up to **10,000 elements** have been tested without noticeable frame drops on modern hardware.

### Can I customise how elements are rendered?

The default rendering covers common floor-plan shapes. Custom rendering is not currently exposed in the public API, but you can use the `metadata` field on elements to store custom data and render an overlay canvas on top.

### What format does `toJSON()` produce?

A plain JavaScript object that is fully `JSON.stringify`-safe. See [VenueLayoutJSON](#venuelayoutjson) for the schema. The `version` field allows for future schema migrations.

---

<p align="center">
  <strong>venue-builder</strong> · Zero-dependency TypeScript Canvas 2D venue layout builder<br/>
  <a href="https://www.npmjs.com/package/venue-builder">npm</a> · <a href="https://github.com/venue-builder/venue-builder">GitHub</a> · <a href="https://github.com/venue-builder/venue-builder/blob/main/LICENSE">MIT License</a>
</p>
