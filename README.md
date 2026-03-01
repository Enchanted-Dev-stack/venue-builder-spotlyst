<p align="center">
  <img src="docs/assets/logo.svg" alt="venue-builder" width="120" />
</p>

<h1 align="center">venue-builder</h1>

<p align="center">
  <strong>Interactive Canvas 2D venue floor plan builder for the web.</strong><br/>
  Design restaurant, cafe, and hospitality layouts — then export clean JSON for any backend.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero dependencies" />
  <img src="https://img.shields.io/badge/types-included-blue" alt="TypeScript" />
  <img src="https://img.shields.io/npm/l/venue-builder?color=22c55e" alt="license" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Element Types](#element-types)
- [API Reference](#api-reference)
  - [Constructor](#constructor)
  - [Element CRUD](#element-crud)
  - [Tool Selection](#tool-selection)
  - [Grouping](#grouping)
  - [Booking API](#booking-api)
  - [Floor / Area Management](#floor--area-management)
  - [Serialization](#serialization)
  - [History](#history)
  - [Grid](#grid)
  - [Querying](#querying)
  - [Events](#events)
  - [Lifecycle](#lifecycle)
- [TypeScript Types](#typescript-types)
- [Booking Status System](#booking-status-system)
- [JSON Export Format](#json-export-format)
- [Multi-Floor / Area System](#multi-floor--area-system)
- [Framework Integration](#framework-integration)
- [Keyboard Shortcuts (Demo)](#keyboard-shortcuts-demo)
- [Color Theme Reference](#color-theme-reference)
- [Building from Source](#building-from-source)
- [Browser Support](#browser-support)
- [License](#license)

---

## Overview

**venue-builder** is a zero-dependency, standalone TypeScript library that renders a fully interactive venue floor plan editor on an HTML Canvas 2D surface. It uses a clean, top-down 2D flat minimal design purpose-built for restaurants, cafes, bars, co-working spaces, and similar hospitality venues.

Design your floor plan visually, group elements into bookable units, manage booking states with color-coded indicators, display customer names and time slots, organize multiple floors and areas, and export everything as portable JSON ready for any database or backend.

---

## Features

### Floor Plan Elements (11 types)
- **Tables** -- round and rectangular, with configurable size, capacity, table number
- **Chairs** -- standalone or auto-grouped with tables; inherit table booking status colors
- **Walls** -- draw multi-point structural walls with configurable thickness
- **Doors** -- place door elements with swing arc indicator
- **Windows** -- glass panel elements with center divider
- **Plants** -- decorative potted plants with leaf detail
- **Counters** -- reception/service counters with register indicator
- **Booths** -- U-shaped booth seating with cushion detail; bookable with status colors
- **Dividers** -- thin partition screens with segment marks
- **Bars** -- bar counters with stool indicators along the bottom edge
- **Lamps** -- floor lamps with glow rings

### Grouping and Booking
- **Grouping** -- combine tables + chairs into a single bookable unit
- **4-state booking system** -- `available`, `reserved`, `occupied`, `blocked`
- **Color-coded status** -- instant visual feedback per table/booth
- **Chair status inheritance** -- grouped chairs adopt the table's status colors and blocked fading
- **Customer name display** -- show guest name directly on the table surface
- **Time slot display** -- show booking start/end times on each table
- **Bulk booking API** -- update all tables at once when the time slot changes

### Multi-Floor and Area Support
- **Multiple floors** -- Floor 1, Floor 2, etc. with independent elements and groups
- **Named areas** -- Garden, Patio, Rooftop, Terrace, VIP, etc.
- **Per-floor isolation** -- each floor/area has its own elements, groups, and undo history
- **Floor switching** -- seamless save/restore when switching between floors

### Editor Experience
- **Snap-to-grid** -- zoom-aware dynamic snapping (10px at 1x, finer at higher zoom)
- **Zoom and pan** -- scroll-wheel zoom + middle-click/right-click drag panning
- **Undo / redo** -- full history stack (Ctrl+Z / Ctrl+Shift+Z)
- **Multi-select** -- Shift+click to add to selection
- **Resize handles** -- drag corners/edges to resize elements
- **Rotation** -- rotate elements in 15-degree increments
- **Grid toggle** -- show/hide the background grid
- **DPR-aware rendering** -- crisp on Retina/HiDPI displays

### Developer Experience
- **Zero dependencies** -- nothing to install alongside it
- **TypeScript-first** -- full type declarations
- **ESM + UMD bundles** -- `import`, `require()`, or drop in a `<script>` tag
- **JSON import / export** -- serialize the entire venue to a plain object
- **Framework-agnostic** -- works with React, Vue, Angular, Svelte, plain HTML

---

## Quick Start

### Installation

```bash
npm install venue-builder
```

### Plain HTML (UMD)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My Venue</title>
  <style>
    #editor { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="editor"></div>

  <script src="dist/venue-builder.umd.js"></script>
  <script>
    const container = document.getElementById('editor');
    const builder = new VenueBuilder.VenueBuilder(container, {
      width: 1200,
      height: 800,
      gridSize: 10,
      showGrid: true,
      snapToGrid: true,
    });

    // Add a rectangular table
    builder.addElement({
      type: 'table',
      x: 200,
      y: 150,
      width: 100,
      height: 70,
      metadata: {
        shape: 'rectangle',
        tableNumber: 1,
        capacity: 4,
        status: 'available',
      },
    });

    // Add a round table with a booking
    builder.addElement({
      type: 'table',
      x: 400,
      y: 150,
      width: 80,
      height: 80,
      metadata: {
        shape: 'round',
        tableNumber: 2,
        capacity: 6,
        status: 'reserved',
        customerName: 'Sarah M.',
        bookingStart: '19:00',
        bookingEnd: '21:00',
      },
    });

    // Export the layout
    const json = builder.toJSON();
    console.log(JSON.stringify(json, null, 2));
  </script>
</body>
</html>
```

### ES Module Import

```ts
import { VenueBuilder } from 'venue-builder';

const builder = new VenueBuilder(document.getElementById('editor')!, {
  width: 1200,
  height: 800,
  gridSize: 10,
});
```

---

## Configuration Options

Pass these to the `VenueBuilder` constructor as the second argument:

```ts
interface VenueBuilderOptions {
  width?: number;       // Canvas world width in px (default: 1200)
  height?: number;      // Canvas world height in px (default: 800)
  gridSize?: number;    // Grid cell size in px (default: 10)
  mode?: 'edit' | 'view'; // Editor mode (default: 'edit')
  showGrid?: boolean;   // Show background grid (default: true)
  snapToGrid?: boolean; // Snap elements to grid (default: true)
}
```

---

## Element Types

Every element is created via `builder.addElement({ type, x, y, width, height, metadata })`. Here is each type and its metadata:

### `table`

Bookable table element. Supports round and rectangular shapes.

```ts
builder.addElement({
  type: 'table',
  x: 100, y: 100,
  width: 100,   // rect default: 100x70, round default: 80x80
  height: 70,
  metadata: {
    shape: 'rectangle',       // 'rectangle' | 'round'
    tableNumber: 1,           // optional, displayed as "T1"
    capacity: 4,              // optional, displayed as "x4" subtitle
    status: 'available',      // 'available' | 'reserved' | 'occupied' | 'blocked'
    label: 'VIP',             // optional, shown if no tableNumber
    customerName: 'John D.',  // optional, shown on the table surface
    bookingStart: '18:00',    // optional, time slot start
    bookingEnd: '20:00',      // optional, time slot end
    reservationId: 'res-123', // optional, for backend reference
  },
});
```

**Visual behavior:**
- **Rectangular tables**: customer name at bottom-left, time slot at top-right
- **Round tables**: customer name centered below label, time slot below that
- **Blocked tables**: entire table rendered at 45% opacity
- When `customerName` is set, the capacity subtitle is hidden

### `chair`

Seat element with a "seat back" line indicator.

```ts
builder.addElement({
  type: 'chair',
  x: 100, y: 200,
  width: 30,   // default: 30x30
  height: 30,
  metadata: { label: 'A1' }, // optional
});
```

**Status inheritance:** When a chair is grouped with a table, it automatically adopts the table's booking status colors and blocked fading. No manual configuration needed.

### `wall`

Multi-point structural wall. Created via the Wall tool (draw mode) or programmatically.

```ts
builder.addElement({
  type: 'wall',
  x: 0, y: 0,
  width: 200, height: 6,
  metadata: {
    points: [{ x: 0, y: 100 }, { x: 200, y: 100 }],
    thickness: 6,
  },
});
```

### `door`

Door element with swing arc indicator.

```ts
builder.addElement({
  type: 'door',
  x: 100, y: 100,
  width: 40,   // default: 40x10
  height: 10,
  metadata: { label: 'Main' }, // optional
});
```

### `window`

Glass panel element with center divider line.

```ts
builder.addElement({
  type: 'window',
  x: 100, y: 100,
  width: 60,   // default: 60x10
  height: 10,
  metadata: { label: 'W1' }, // optional
});
```

### `plant`

Decorative potted plant with circular leaf shapes.

```ts
builder.addElement({
  type: 'plant',
  x: 100, y: 100,
  width: 40,   // default: 40x40
  height: 40,
  metadata: { label: 'Fern' }, // optional
});
```

### `counter`

Reception or service counter with register indicator dots.

```ts
builder.addElement({
  type: 'counter',
  x: 100, y: 100,
  width: 140,  // default: 140x50
  height: 50,
  metadata: { label: 'Reception' }, // optional
});
```

### `booth`

U-shaped booth seating. Bookable like tables -- supports status colors, customer name, and time slots.

```ts
builder.addElement({
  type: 'booth',
  x: 100, y: 100,
  width: 100,  // default: 100x70
  height: 70,
  metadata: {
    label: 'Booth',
    capacity: 4,
    status: 'available',       // same 4-state system as tables
    customerName: 'Emily R.',  // optional
    bookingStart: '20:00',     // optional
    bookingEnd: '22:00',       // optional
  },
});
```

### `divider`

Thin partition screen with segment marks.

```ts
builder.addElement({
  type: 'divider',
  x: 100, y: 100,
  width: 80,   // default: 80x8
  height: 8,
  metadata: { label: 'Partition' }, // optional
});
```

### `bar`

Bar counter with stool circle indicators along the bottom edge.

```ts
builder.addElement({
  type: 'bar',
  x: 100, y: 100,
  width: 160,  // default: 160x40
  height: 40,
  metadata: {
    label: 'Bar',
    stools: 4,  // number of stool circles to render
  },
});
```

### `lamp`

Floor lamp with glow rings and ray lines.

```ts
builder.addElement({
  type: 'lamp',
  x: 100, y: 100,
  width: 30,   // default: 30x30
  height: 30,
  metadata: { label: 'Lamp' }, // optional
});
```

---

## API Reference

### Constructor

```ts
const builder = new VenueBuilder(container: HTMLElement, options?: VenueBuilderOptions);
```

Creates and mounts the canvas editor inside `container`. The canvas fills the container and resizes automatically via `ResizeObserver`.

---

### Element CRUD

#### `addElement(data)`

```ts
addElement(data: Partial<ElementData> & { type: string }): BaseElement
```

Add an element to the canvas. Returns the created element instance. Saves to history and emits `elementAdded` + `layoutChanged` events.

```ts
const table = builder.addElement({
  type: 'table',
  x: 200, y: 150,
  width: 100, height: 70,
  metadata: { shape: 'rectangle', tableNumber: 1, capacity: 4, status: 'available' },
});
console.log(table.id); // UUID string
```

#### `removeElement(id)`

```ts
removeElement(id: string): void
```

Remove an element by ID. Saves to history and emits `elementRemoved` + `layoutChanged`.

#### `updateElement(id, updates)`

```ts
updateElement(id: string, updates: Partial<ElementData>): void
```

Update any properties of an element. For metadata changes, pass the full metadata object:

```ts
builder.updateElement(tableId, {
  x: 300,
  metadata: { ...existingMetadata, status: 'reserved', customerName: 'Alice' },
});
```

#### `addElementSilent(data)` / `removeElementSilent(id)`

Same as `addElement`/`removeElement` but **without** saving to history or emitting events. Useful for bulk programmatic setup.

---

### Tool Selection

#### `setTool(toolType, config?)`

```ts
setTool(toolType: ToolType, config?: { shape?: TableShape }): void
```

Switch the active drawing/interaction tool. Emits `toolChanged`.

```ts
// Available tool types:
type ToolType =
  | 'select'
  | 'addTable'     // requires config.shape: 'rectangle' | 'round'
  | 'addChair'
  | 'addWall'      // draw mode: click to place points, double-click to finish
  | 'addDoor'
  | 'addWindow'
  | 'addPlant'
  | 'addCounter'
  | 'addBooth'
  | 'addDivider'
  | 'addBar'
  | 'addLamp';

// Examples:
builder.setTool('select');
builder.setTool('addTable', { shape: 'round' });
builder.setTool('addChair');
builder.setTool('addWall');
```

#### `getToolType()`

```ts
getToolType(): ToolType
```

Returns the currently active tool type.

---

### Grouping

#### `groupSelected()`

```ts
groupSelected(): GroupData | null
```

Group the currently selected elements into a bookable unit. Requires 2+ selected elements. For round tables, chairs are automatically positioned evenly around the table.

#### `groupElementsByIds(ids, options?)`

```ts
groupElementsByIds(ids: string[], options?: { autoRotate?: boolean }): GroupData | null
```

Group specific elements by their IDs. Set `autoRotate: false` to skip auto-positioning of chairs around round tables.

```ts
const group = builder.groupElementsByIds([tableId, chair1Id, chair2Id]);
```

#### `ungroupSelected()`

```ts
ungroupSelected(): void
```

Ungroup any groups that contain selected elements.

---

### Booking API

#### `setBooking(elementId, booking)`

```ts
setBooking(elementId: string, booking: {
  status: 'available' | 'reserved' | 'occupied' | 'blocked';
  customerName?: string;
  bookingStart?: string;
  bookingEnd?: string;
  reservationId?: string;
}): void
```

Update a single table/booth's booking state. Emits `elementUpdated`.

```ts
builder.setBooking(tableId, {
  status: 'reserved',
  customerName: 'Sarah M.',
  bookingStart: '19:00',
  bookingEnd: '21:00',
  reservationId: 'res-456',
});
```

#### `applyBookings(bookings)`

```ts
applyBookings(bookings: Array<{
  elementId?: string;
  tableNumber?: number;
  status: 'available' | 'reserved' | 'occupied' | 'blocked';
  customerName?: string;
  bookingStart?: string;
  bookingEnd?: string;
  reservationId?: string;
}>): void
```

**Bulk-apply bookings** to all bookable elements (tables and booths) on the current floor. Each entry is matched by `elementId` or `tableNumber`. **Elements not mentioned in the array are automatically reset to `available` with no customer.**

This is the primary method your front-end should call when the user changes the selected time slot:

```ts
// User selects "7:00 PM - 9:00 PM" time slot
const bookingsForTimeSlot = await fetch('/api/bookings?from=19:00&to=21:00').then(r => r.json());

builder.applyBookings([
  { tableNumber: 1, status: 'reserved', customerName: 'Sarah M.', bookingStart: '19:00', bookingEnd: '21:00' },
  { tableNumber: 3, status: 'occupied', customerName: 'John D.', bookingStart: '18:30', bookingEnd: '20:30' },
  { tableNumber: 5, status: 'blocked' },
  // Tables 2, 4, 6 are not listed -> automatically set to 'available'
]);
```

---

### Floor / Area Management

The builder supports multiple independent floors and named areas. Each floor/area has its own set of elements and groups. Only one floor is active (visible) at a time.

A default "Floor 1" is created automatically on initialization.

#### `addFloor(name, type?)`

```ts
addFloor(name: string, type?: 'floor' | 'area'): FloorData
```

Create a new floor or area. Emits `floorAdded`.

```ts
const floor2 = builder.addFloor('Floor 2', 'floor');
const garden = builder.addFloor('Garden', 'area');
```

#### `removeFloor(floorId)`

```ts
removeFloor(floorId: string): boolean
```

Remove a floor/area. Cannot remove the last remaining floor. Returns `false` if removal failed. If the active floor is removed, the builder automatically switches to the first remaining floor.

#### `switchFloor(floorId)`

```ts
switchFloor(floorId: string): boolean
```

Switch to a different floor/area. The current floor's state (all elements and groups) is automatically saved before switching. The target floor's elements and groups are loaded onto the canvas. Undo history is reset per-floor.

```ts
builder.switchFloor(garden.id);
// Canvas now shows the Garden area
```

#### `renameFloor(floorId, name)`

```ts
renameFloor(floorId: string, name: string): void
```

Rename a floor/area. Emits `floorRenamed`.

#### `getFloors()`

```ts
getFloors(): FloorData[]
```

Get all floors/areas in order. The active floor's data is up-to-date (saved before returning).

```ts
const floors = builder.getFloors();
// [{ id: '...', name: 'Floor 1', type: 'floor', order: 0, elements: [...], groups: [...] }, ...]
```

#### `getActiveFloorId()`

```ts
getActiveFloorId(): string
```

Get the ID of the currently active floor.

---

### Serialization

#### `toJSON()`

```ts
toJSON(): LayoutData
```

Serialize the entire venue (all floors, elements, groups, canvas settings) to a plain JSON-compatible object. The active floor's state is saved before serialization.

```ts
const layout = builder.toJSON();
// Save to your backend
await fetch('/api/venues/1/layout', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(layout),
});
```

#### `loadJSON(data)`

```ts
loadJSON(data: LayoutData): void
```

Load a complete venue layout from JSON. Replaces all current state. Backward-compatible with single-floor layouts (v1.0).

```ts
const saved = await fetch('/api/venues/1/layout').then(r => r.json());
builder.loadJSON(saved);
```

---

### History

#### `undo()` / `redo()`

```ts
undo(): void
redo(): void
```

Navigate the undo/redo history stack. History is per-floor -- switching floors resets the history.

---

### Grid

#### `setShowGrid(show)` / `getShowGrid()`

```ts
setShowGrid(show: boolean): void
getShowGrid(): boolean
```

Show or hide the background grid. In production apps, call `builder.setShowGrid(false)` for a clean view.

---

### Querying

#### `getElements()`

```ts
getElements(): ElementData[]
```

Get all elements on the current floor as plain data objects.

#### `getGroups()`

```ts
getGroups(): GroupData[]
```

Get all groups on the current floor.

#### `getSelectedElements()`

```ts
getSelectedElements(): ElementData[]
```

Get the currently selected elements.

---

### Events

#### `on(event, callback)`

```ts
on<K extends keyof BuilderEvent>(event: K, callback: (data: BuilderEvent[K]) => void): () => void
```

Subscribe to an event. Returns an unsubscribe function.

```ts
// Listen for element selection
const unsub = builder.on('elementSelected', ({ element, group }) => {
  console.log('Selected:', element?.id, 'Group:', group?.id);
});

// Later: unsubscribe
unsub();
```

**Available events:**

| Event | Payload | When |
|---|---|---|
| `elementSelected` | `{ element: ElementData \| null, group?: GroupData }` | An element is selected or deselected |
| `elementAdded` | `{ element: ElementData }` | An element is added |
| `elementRemoved` | `{ element: ElementData }` | An element is removed |
| `elementUpdated` | `{ element: ElementData, changes: Partial<ElementData> }` | An element's properties change |
| `layoutChanged` | `{ layout: LayoutData }` | Any layout change (add/remove/update) |
| `toolChanged` | `{ tool: ToolType }` | The active tool changes |
| `groupCreated` | `{ group: GroupData }` | A new group is created |
| `groupRemoved` | `{ group: GroupData }` | A group is dissolved |
| `floorChanged` | `{ floor: FloorData }` | The active floor switches |
| `floorAdded` | `{ floor: FloorData }` | A new floor/area is created |
| `floorRemoved` | `{ floor: FloorData }` | A floor/area is removed |
| `floorRenamed` | `{ floor: FloorData }` | A floor/area is renamed |

---

### Lifecycle

#### `destroy()`

```ts
destroy(): void
```

Tear down the editor: stop the render loop, unbind all event listeners, remove the canvas from the DOM, and free resources. Always call this when unmounting.

```ts
// React useEffect cleanup
useEffect(() => {
  const b = new VenueBuilder(ref.current!, options);
  return () => b.destroy();
}, []);
```

---

## TypeScript Types

All types are exported from the package root:

```ts
import type {
  // Core
  ElementData,
  ElementType,        // 'table' | 'chair' | 'wall' | 'door' | 'window' | 'plant' | 'counter' | 'booth' | 'divider' | 'bar' | 'lamp'
  TableShape,         // 'rectangle' | 'round'
  BookingStatus,      // 'available' | 'reserved' | 'occupied' | 'blocked'
  ToolType,           // 'select' | 'addTable' | 'addChair' | ... | 'addLamp'
  Point,              // { x: number; y: number }

  // Specialized element data
  TableData,
  WallData,
  ChairData,
  DoorData,
  WindowData,

  // Grouping
  GroupData,

  // Floors
  FloorData,
  FloorAreaType,      // 'floor' | 'area'

  // Layout
  LayoutData,
  VenueBuilderOptions,
  BuilderEvent,
} from 'venue-builder';
```

### `ElementData`

Base interface for all canvas elements:

```ts
interface ElementData {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;        // degrees
  groupId?: string;        // set when element belongs to a group
  metadata: Record<string, any>;
}
```

### `GroupData`

```ts
interface GroupData {
  id: string;
  elementIds: string[];
  metadata: {
    tableNumber?: number;
    capacity?: number;
    status: BookingStatus;
    label?: string;
    customerName?: string;
    bookingStart?: string;
    bookingEnd?: string;
    reservationId?: string;
    timeSlot?: string;
    [key: string]: any;
  };
}
```

### `FloorData`

```ts
interface FloorData {
  id: string;
  name: string;
  type: 'floor' | 'area';
  order: number;
  elements: ElementData[];
  groups: GroupData[];
}
```

### `LayoutData`

The top-level serialized format returned by `toJSON()`:

```ts
interface LayoutData {
  version: string;         // currently "1.1"
  canvas: {
    width: number;
    height: number;
    gridSize: number;
  };
  elements: ElementData[]; // active floor's elements (backward compat)
  groups: GroupData[];      // active floor's groups (backward compat)
  floors?: FloorData[];    // all floors with their elements + groups
  activeFloorId?: string;  // which floor was active when saved
}
```

---

## Booking Status System

Tables and booths support a 4-state booking system:

| Status | Fill Color | Stroke Color | Opacity | Description |
|---|---|---|---|---|
| `available` | `#F1F5F9` (light grey) | `#94A3B8` (grey) | 100% | Open for booking |
| `reserved` | `#FFF7ED` (light orange) | `#F97316` (orange) | 100% | Booked for upcoming guest |
| `occupied` | `#EFF6FF` (light blue) | `#3B82F6` (blue) | 100% | Currently in use |
| `blocked` | `#F9FAFB` (near-white) | `#D1D5DB` (pale grey) | 45% | Not available |

### Chair Status Inheritance

When chairs are grouped with a table:
- Chairs automatically adopt the table's status fill and stroke colors
- Blocked tables cause grouped chairs to render at 45% opacity too
- This happens automatically in the render loop -- no manual configuration

### Customer Name Rendering

When `customerName` is set on a table:

- **Rectangular tables**: Name appears at the **bottom-left** corner in the status stroke color. Time slot appears at the **top-right** corner.
- **Round tables**: Name appears **centered below** the table number. Time slot appears below the name.
- The capacity subtitle (`x4`) is hidden when a customer name is present.
- Long names are automatically truncated with an ellipsis.

---

## JSON Export Format

```json
{
  "version": "1.1",
  "canvas": {
    "width": 1200,
    "height": 800,
    "gridSize": 10
  },
  "elements": [
    {
      "id": "a1b2c3d4-...",
      "type": "table",
      "x": 200,
      "y": 150,
      "width": 100,
      "height": 70,
      "rotation": 0,
      "metadata": {
        "shape": "rectangle",
        "tableNumber": 1,
        "capacity": 4,
        "status": "reserved",
        "customerName": "Sarah M.",
        "bookingStart": "19:00",
        "bookingEnd": "21:00",
        "reservationId": "res-456"
      }
    },
    {
      "id": "e5f6g7h8-...",
      "type": "chair",
      "x": 210,
      "y": 100,
      "width": 30,
      "height": 30,
      "rotation": 0,
      "groupId": "grp-123-...",
      "metadata": {}
    }
  ],
  "groups": [
    {
      "id": "grp-123-...",
      "elementIds": ["a1b2c3d4-...", "e5f6g7h8-..."],
      "metadata": {
        "status": "available"
      }
    }
  ],
  "floors": [
    {
      "id": "floor-1-...",
      "name": "Floor 1",
      "type": "floor",
      "order": 0,
      "elements": [ /* ... same structure as top-level elements */ ],
      "groups": [ /* ... same structure as top-level groups */ ]
    },
    {
      "id": "floor-2-...",
      "name": "Garden",
      "type": "area",
      "order": 1,
      "elements": [],
      "groups": []
    }
  ],
  "activeFloorId": "floor-1-..."
}
```

> **Backward compatibility:** v1.0 layouts without `floors[]` are automatically migrated to a single "Floor 1" when loaded via `loadJSON()`.

---

## Multi-Floor / Area System

The builder supports independent floors and areas within a single venue.

### Concepts

- **Floor**: A physical level of the building (Floor 1, Floor 2, Mezzanine).
- **Area**: A named zone within the venue (Garden, Patio, Rooftop, VIP Room, Terrace).
- Both use the same `FloorData` type -- `type` is either `'floor'` or `'area'`.
- Each floor/area has its own independent `elements[]` and `groups[]`.
- Only one floor is rendered on the canvas at any time.
- Switching floors automatically saves the current floor's state and loads the target floor.

### Usage

```ts
// Builder starts with "Floor 1" by default

// Add more floors/areas
const floor2 = builder.addFloor('Floor 2', 'floor');
const garden = builder.addFloor('Garden', 'area');
const rooftop = builder.addFloor('Rooftop', 'area');

// Switch to the garden -- Floor 1 state is auto-saved
builder.switchFloor(garden.id);

// Add elements to the garden
builder.addElement({ type: 'table', x: 100, y: 100, ... });
builder.addElement({ type: 'plant', x: 200, y: 200, ... });

// Switch back to Floor 1 -- garden state is auto-saved
builder.switchFloor(builder.getFloors()[0].id);

// Get all floors with their current state
const allFloors = builder.getFloors();
allFloors.forEach(f => {
  console.log(`${f.name} (${f.type}): ${f.elements.length} elements`);
});

// Rename
builder.renameFloor(garden.id, 'Outdoor Garden');

// Remove (can't remove the last floor)
builder.removeFloor(rooftop.id);
```

---

## Framework Integration

### React

```tsx
import { useRef, useEffect, useCallback } from 'react';
import { VenueBuilder, LayoutData } from 'venue-builder';

interface Props {
  initialLayout?: LayoutData;
  onSave?: (layout: LayoutData) => void;
}

export function VenueEditor({ initialLayout, onSave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const builderRef = useRef<VenueBuilder | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const builder = new VenueBuilder(containerRef.current, {
      width: 1200,
      height: 800,
      gridSize: 10,
    });

    if (initialLayout) {
      builder.loadJSON(initialLayout);
    }

    builderRef.current = builder;
    return () => builder.destroy();
  }, []);

  const handleSave = useCallback(() => {
    if (builderRef.current && onSave) {
      onSave(builderRef.current.toJSON());
    }
  }, [onSave]);

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '80vh' }} />
      <button onClick={handleSave}>Save Layout</button>
    </div>
  );
}
```

### Vue 3

```vue
<template>
  <div>
    <div ref="containerRef" style="width: 100%; height: 80vh" />
    <button @click="save">Save Layout</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { VenueBuilder } from 'venue-builder';

const containerRef = ref<HTMLDivElement>();
let builder: VenueBuilder | null = null;

onMounted(() => {
  if (containerRef.value) {
    builder = new VenueBuilder(containerRef.value, {
      width: 1200,
      height: 800,
      gridSize: 10,
    });
  }
});

onBeforeUnmount(() => builder?.destroy());

function save() {
  const json = builder?.toJSON();
  console.log(json);
}
</script>
```

### Read-Only / Viewer Mode

For customer-facing booking UIs where editing is disabled:

```ts
const builder = new VenueBuilder(container, {
  mode: 'view',
  showGrid: false,
});

// Load the venue layout
builder.loadJSON(savedLayout);

// Dynamically update bookings based on selected time slot
builder.applyBookings(currentBookings);
```

---

## Keyboard Shortcuts (Demo)

These shortcuts are implemented in the demo app (`demo/index.html`), not in the library core. Implement similar shortcuts in your own UI as needed.

| Key | Action |
|---|---|
| `V` | Select tool |
| `W` | Wall tool |
| `T` | Rectangular table tool |
| `R` | Round table tool |
| `C` | Chair tool |
| `D` | Door tool |
| `N` | Window tool |
| `P` | Plant tool |
| `K` | Counter tool |
| `H` | Booth tool |
| `I` | Divider tool |
| `B` | Bar tool |
| `L` | Lamp tool |
| `G` | Table generator |
| `Shift+G` | Toggle grid |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Delete` / `Backspace` | Delete selected |
| `Ctrl+G` | Group selected |

---

## Color Theme Reference

The library uses a fixed color palette defined in `src/theme/colors.ts`. The `COLORS` object is exported from the package:

```ts
import { COLORS } from 'venue-builder';
```

### Element Colors

| Element | Fill | Stroke |
|---|---|---|
| Wall | `#475569` | `#334155` |
| Table | `#FFFFFF` | `#94A3B8` |
| Chair | `#F1F5F9` | `#94A3B8` |
| Door | `#FFFFFF` | `#64748B` |
| Window | `#DBEAFE` | `#93C5FD` |
| Plant | `#D1FAE5` | `#059669` |
| Counter | `#F5F3FF` | `#7C3AED` |
| Booth | `#FEF3C7` | `#D97706` |
| Divider | `#E0E7FF` | `#6366F1` |
| Bar | `#FDF2F8` | `#DB2777` |
| Lamp | `#FEF9C3` | `#CA8A04` |

### Status Colors

| Status | Fill | Stroke |
|---|---|---|
| Available | `#F1F5F9` | `#94A3B8` |
| Reserved | `#FFF7ED` | `#F97316` |
| Occupied | `#EFF6FF` | `#3B82F6` |
| Blocked | `#F9FAFB` | `#D1D5DB` |

---

## Building from Source

```bash
git clone https://github.com/Enchanted-Dev-stack/venue-builder-spotlyst.git
cd venue-builder-spotlyst
npm install
npm run build         # produces dist/venue-builder.umd.js + dist/venue-builder.esm.js
npm run dev           # watch mode with rollup
```

### Running the Demo

```bash
npx http-server . -p 8080 -c-1 --cors
# Open http://localhost:8080/demo/
```

### Project Structure

```
venue-builder/
  src/
    core/
      types.ts            # All TypeScript types and interfaces
      Camera.ts           # Pan/zoom camera
      Grid.ts             # Background grid renderer
      ElementManager.ts   # Element collection CRUD
      SelectionManager.ts # Selection/hover tracking + resize handles
      HistoryManager.ts   # Undo/redo stack
      GroupManager.ts     # Group CRUD + group outline rendering
      FloorManager.ts     # Multi-floor/area state management
      InteractionManager.ts # Mouse/keyboard event routing
    elements/
      BaseElement.ts      # Abstract base class for all elements
      TableElement.ts     # Table rendering with status + customer name
      ChairElement.ts     # Chair rendering with status inheritance
      WallElement.ts      # Multi-point wall rendering
      DoorElement.ts      # Door with swing arc
      WindowElement.ts    # Window with glass panel
      PlantElement.ts     # Potted plant
      CounterElement.ts   # Service counter
      BoothElement.ts     # Booth seating with status support
      DividerElement.ts   # Partition screen
      BarElement.ts       # Bar counter with stools
      LampElement.ts      # Floor lamp
      index.ts            # Element factory (createElement)
    tools/
      BaseTool.ts         # Abstract tool base class
      SelectTool.ts       # Select, move, resize interactions
      AddElementTool.ts   # Click-to-place element tool
      WallTool.ts         # Multi-point wall drawing tool
    events/
      EventEmitter.ts     # Type-safe event emitter
    serializer/
      Serializer.ts       # JSON serialize/deserialize
    theme/
      colors.ts           # Color palette constants
    utils/
      constants.ts        # Dimension/physics constants
      math.ts             # Geometry helpers (hitTest, snap, distance)
      uuid.ts             # UUID generator
    VenueBuilder.ts       # Main public API class
    index.ts              # Package entry point (re-exports)
  demo/
    index.html            # Full-featured demo application
  dist/                   # Build output
  package.json
  tsconfig.json
  rollup.config.js
```

---

## Browser Support

| Browser | Version |
|---|---|
| Chrome | 80+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 80+ |

Canvas 2D is required. No WebGL dependency.

---

## License

[MIT](LICENSE)
