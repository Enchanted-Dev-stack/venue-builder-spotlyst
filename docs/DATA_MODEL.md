# venue-builder — JSON Schema / Data Model Reference

> **Package:** `venue-builder`
> **Schema Version:** `1.0`
> **Last Updated:** 2025-01-20

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Root Object](#root-object)
4. [Canvas](#canvas)
5. [Elements](#elements)
   - [Common Fields](#common-fields)
   - [Table Element](#table-element)
   - [Chair Element](#chair-element)
   - [Wall Element](#wall-element)
   - [Door Element](#door-element)
   - [Window Element](#window-element)
6. [Groups](#groups)
7. [Enumerations](#enumerations)
8. [TypeScript Interfaces](#typescript-interfaces)
9. [Complete JSON Example](#complete-json-example)
10. [Relationships & Lookup Patterns](#relationships--lookup-patterns)
11. [Consumer Guide (Flutter / Backend)](#consumer-guide-flutter--backend)
12. [Schema Migration Strategy](#schema-migration-strategy)
13. [Validation Rules](#validation-rules)
14. [FAQ](#faq)

---

## Overview

The `venue-builder` package serializes an entire venue layout into a **single flat JSON object**. This object is the canonical representation of a venue's spatial configuration — tables, chairs, walls, doors, windows, and logical groupings — and can be:

- **Stored** in any database (relational, document, key-value).
- **Imported/Exported** by the builder UI for editing.
- **Rendered natively** by Flutter, React Native, or any other consumer.
- **Consumed by backends** for reservation and booking logic.

The JSON is intentionally self-contained: a single document holds everything needed to reconstruct and render the layout, with no external references required.

---

## Design Principles

| Principle | Description |
|---|---|
| **Single Document** | The entire layout lives in one JSON blob — no joins, no references to external collections. |
| **O(1) Group Lookup** | Every element carries a `groupId` field, so consumers can determine group membership without scanning arrays. |
| **Groups as Source of Truth** | Booking-related metadata (status, reservationId, capacity) lives on the **group**, not on individual elements. |
| **World Coordinates** | All `x`, `y`, and `points` values are in world-space pixels relative to the canvas origin `(0, 0)` at top-left. |
| **Extensibility via `custom`** | Every `metadata` block includes a free-form `custom` object for domain-specific data without schema changes. |
| **Version Field** | The top-level `version` string enables forward-compatible schema migrations. |

---

## Root Object

The top-level JSON object exported/imported by the builder.

| Field | Type | Required | Description |
|---|---|---|---|
| `version` | `string` | ✅ Yes | Schema version identifier. Currently `"1.0"`. Used for migration detection. |
| `canvas` | [`Canvas`](#canvas) | ✅ Yes | Defines the drawing surface dimensions and grid configuration. |
| `elements` | [`Element[]`](#elements) | ✅ Yes | Array of all visual/spatial elements in the layout. May be empty (`[]`). |
| `groups` | [`Group[]`](#groups) | ✅ Yes | Array of logical element groupings (e.g., a table + its chairs). May be empty (`[]`). |

```jsonc
{
  "version": "1.0",
  "canvas": { /* ... */ },
  "elements": [ /* ... */ ],
  "groups": [ /* ... */ ]
}
```

---

## Canvas

Defines the drawing surface on which all elements are placed.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `width` | `number` | ✅ Yes | — | Width of the canvas in world-coordinate pixels. Must be > 0. |
| `height` | `number` | ✅ Yes | — | Height of the canvas in world-coordinate pixels. Must be > 0. |
| `gridSize` | `number` | ✅ Yes | — | Snap grid cell size in pixels. Elements snap to multiples of this value. Must be > 0. |

### Notes

- The canvas origin `(0, 0)` is at the **top-left** corner.
- The positive X axis extends **rightward**; the positive Y axis extends **downward**.
- `gridSize` is used by the builder for snap-to-grid behavior; consumers may ignore it during rendering.

```json
{
  "width": 1200,
  "height": 800,
  "gridSize": 20
}
```

---

## Elements

The `elements` array contains every visual object in the layout. There are two structural categories:

1. **Box Elements** — Positioned with `x`, `y`, `width`, `height`, `rotation`. Used by: `table`, `chair`, `door`, `window`.
2. **Polyline Elements** — Positioned with `points[]` and `thickness`. Used by: `wall`.

### Common Fields

These fields are present on **every** element regardless of type.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ Yes | Globally unique identifier (UUID v4 recommended, e.g. `"el_a1b2c3d4"`). |
| `type` | [`ElementType`](#elementtype) | ✅ Yes | Discriminator that determines the element's schema shape. One of: `"table"`, `"chair"`, `"wall"`, `"door"`, `"window"`. |
| `metadata` | `object` | ✅ Yes | Type-specific metadata. Always contains at least `label` and `custom`. |

### Box Element Fields

Present on elements of type `table`, `chair`, `door`, `window`.

| Field | Type | Required | Description |
|---|---|---|---|
| `shape` | [`Shape`](#shape) | ✅ Yes | Visual shape of the element. See [Shape enum](#shape). |
| `x` | `number` | ✅ Yes | X position of the element's top-left corner in world coordinates. |
| `y` | `number` | ✅ Yes | Y position of the element's top-left corner in world coordinates. |
| `width` | `number` | ✅ Yes | Width of the element's bounding box in pixels. Must be > 0. |
| `height` | `number` | ✅ Yes | Height of the element's bounding box in pixels. Must be > 0. |
| `rotation` | `number` | ✅ Yes | Clockwise rotation in degrees around the element's center point. Range: `0–359`. |
| `groupId` | `string \| null` | ✅ Yes | ID of the group this element belongs to, or `null` if ungrouped. Enables O(1) group membership lookup. |

### Polyline Element Fields

Present on elements of type `wall`.

| Field | Type | Required | Description |
|---|---|---|---|
| `points` | `Point[]` | ✅ Yes | Ordered array of `{x, y}` vertices defining the wall's path. Minimum 2 points. |
| `thickness` | `number` | ✅ Yes | Stroke thickness of the wall in pixels. Must be > 0. |

#### Point Object

| Field | Type | Required | Description |
|---|---|---|---|
| `x` | `number` | ✅ Yes | X coordinate in world space. |
| `y` | `number` | ✅ Yes | Y coordinate in world space. |

> ⚠️ **Wall elements do NOT have** `x`, `y`, `width`, `height`, `rotation`, `shape`, or `groupId` fields. Their position is entirely defined by `points[]`.

---

### Table Element

Represents a table surface in the venue.

**Type discriminator:** `"type": "table"`

**Category:** Box Element

| Metadata Field | Type | Required | Description |
|---|---|---|---|
| `metadata.label` | `string` | ✅ Yes | Human-readable display name (e.g. `"Table 1"`). |
| `metadata.tableNumber` | `number` | ✅ Yes | Numeric table identifier, unique within the layout. |
| `metadata.capacity` | `number` | ✅ Yes | Maximum seating capacity. Must be ≥ 1. |
| `metadata.status` | [`Status`](#status) | ✅ Yes | Current booking status of the table. |
| `metadata.reservationId` | `string \| null` | ✅ Yes | ID of the active reservation, or `null` if none. |
| `metadata.timeSlot` | `string \| null` | ✅ Yes | ISO 8601 time range or descriptor for the current reservation, or `null`. |
| `metadata.custom` | `object` | ✅ Yes | Free-form object for domain-specific extensions. |

```json
{
  "id": "el_uuid",
  "type": "table",
  "shape": "rectangle",
  "x": 100,
  "y": 200,
  "width": 80,
  "height": 80,
  "rotation": 0,
  "groupId": "grp_uuid",
  "metadata": {
    "label": "Table 1",
    "tableNumber": 1,
    "capacity": 4,
    "status": "available",
    "reservationId": null,
    "timeSlot": null,
    "custom": {}
  }
}
```

**Shape options:** `"rectangle"` or `"round"`. Round tables are rendered as circles/ellipses inscribed within the bounding box.

---

### Chair Element

Represents an individual seat.

**Type discriminator:** `"type": "chair"`

**Category:** Box Element

| Metadata Field | Type | Required | Description |
|---|---|---|---|
| `metadata.label` | `string` | ✅ Yes | Human-readable label (e.g. `"Chair"`, `"Seat A"`). |
| `metadata.custom` | `object` | ✅ Yes | Free-form object for domain-specific extensions. |

```json
{
  "id": "el_uuid2",
  "type": "chair",
  "shape": "rectangle",
  "x": 120,
  "y": 180,
  "width": 20,
  "height": 20,
  "rotation": 0,
  "groupId": "grp_uuid",
  "metadata": {
    "label": "Chair",
    "custom": {}
  }
}
```

> 💡 Chairs are typically grouped with a table via `groupId`. The group's metadata holds booking state — the chair itself carries no reservation data.

---

### Wall Element

Represents a structural wall defined as a polyline.

**Type discriminator:** `"type": "wall"`

**Category:** Polyline Element

| Metadata Field | Type | Required | Description |
|---|---|---|---|
| `metadata.label` | `string` | ✅ Yes | Human-readable label (e.g. `"North Wall"`). |
| `metadata.custom` | `object` | ✅ Yes | Free-form object for domain-specific extensions. |

```json
{
  "id": "el_uuid3",
  "type": "wall",
  "points": [
    { "x": 0, "y": 0 },
    { "x": 400, "y": 0 },
    { "x": 400, "y": 300 }
  ],
  "thickness": 6,
  "metadata": {
    "label": "North Wall",
    "custom": {}
  }
}
```

> ⚠️ Walls cannot be part of groups. They have no `groupId`, `shape`, `x`, `y`, `width`, `height`, or `rotation` fields.

---

### Door Element

Represents a door or entrance point.

**Type discriminator:** `"type": "door"`

**Category:** Box Element

| Metadata Field | Type | Required | Description |
|---|---|---|---|
| `metadata.label` | `string` | ✅ Yes | Human-readable label (e.g. `"Main Entrance"`). |
| `metadata.swingDirection` | `string` | ✅ Yes | Direction the door opens. Typically `"inward"` or `"outward"`. |
| `metadata.custom` | `object` | ✅ Yes | Free-form object for domain-specific extensions. |

```json
{
  "id": "el_uuid4",
  "type": "door",
  "shape": "rectangle",
  "x": 200,
  "y": 0,
  "width": 40,
  "height": 6,
  "rotation": 0,
  "groupId": null,
  "metadata": {
    "label": "Main Entrance",
    "swingDirection": "inward",
    "custom": {}
  }
}
```

---

### Window Element

Represents a window opening in a wall.

**Type discriminator:** `"type": "window"`

**Category:** Box Element

| Metadata Field | Type | Required | Description |
|---|---|---|---|
| `metadata.label` | `string` | ✅ Yes | Human-readable label (e.g. `"Front Window"`). |
| `metadata.custom` | `object` | ✅ Yes | Free-form object for domain-specific extensions. |

```json
{
  "id": "el_uuid5",
  "type": "window",
  "shape": "rectangle",
  "x": 300,
  "y": 0,
  "width": 60,
  "height": 6,
  "rotation": 0,
  "groupId": null,
  "metadata": {
    "label": "Front Window",
    "custom": {}
  }
}
```

---

## Groups

Groups logically bind multiple elements together (e.g., a table with its surrounding chairs). The `groups` array is the **single source of truth** for booking and reservation metadata.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ Yes | Globally unique identifier (UUID v4 recommended, e.g. `"grp_a1b2c3d4"`). |
| `elementIds` | `string[]` | ✅ Yes | Ordered array of element IDs belonging to this group. Minimum 1 element. |
| `metadata` | `object` | ✅ Yes | Booking and display metadata for the group. |

### Group Metadata

| Field | Type | Required | Description |
|---|---|---|---|
| `metadata.label` | `string` | ✅ Yes | Display name for the group (e.g. `"Table 1"`). |
| `metadata.tableNumber` | `number` | ✅ Yes | Numeric table identifier for the group. |
| `metadata.capacity` | `number` | ✅ Yes | Total seating capacity of the group. Must be ≥ 1. |
| `metadata.status` | [`Status`](#status) | ✅ Yes | Current booking status. |
| `metadata.reservationId` | `string \| null` | ✅ Yes | Active reservation ID, or `null`. |
| `metadata.timeSlot` | `string \| null` | ✅ Yes | Time range for the reservation, or `null`. |
| `metadata.custom` | `object` | ✅ Yes | Free-form object for domain-specific extensions. |

```json
{
  "id": "grp_uuid",
  "elementIds": ["el_uuid", "el_uuid2"],
  "metadata": {
    "label": "Table 1",
    "tableNumber": 1,
    "capacity": 4,
    "status": "available",
    "reservationId": null,
    "timeSlot": null,
    "custom": {}
  }
}
```

### Group ↔ Element Relationship

The relationship between groups and elements is maintained through **dual references** for fast access in both directions:

| Direction | Mechanism | Complexity |
|---|---|---|
| **Element → Group** | `element.groupId` points to `group.id` | O(1) |
| **Group → Elements** | `group.elementIds[]` lists all member element IDs | O(1) |

> ⚠️ **Invariant:** These two references must be kept in sync. If `element.groupId === "grp_1"`, then `groups.find(g => g.id === "grp_1").elementIds` **must** contain that element's `id`, and vice versa.

---

## Enumerations

### ElementType

Discriminator for the `type` field on elements.

| Value | Description | Category |
|---|---|---|
| `"table"` | A table surface | Box Element |
| `"chair"` | An individual seat | Box Element |
| `"wall"` | A structural wall | Polyline Element |
| `"door"` | A door or entrance | Box Element |
| `"window"` | A window opening | Box Element |

### Shape

Visual rendering shape for box elements.

| Value | Description | Used By |
|---|---|---|
| `"rectangle"` | Rendered as a rectangle (or square) | `table`, `chair`, `door`, `window` |
| `"round"` | Rendered as a circle/ellipse inscribed within the bounding box | `table` |

### Status

Booking status for tables and groups.

| Value | Description |
|---|---|
| `"available"` | Not reserved — open for seating. |
| `"reserved"` | Reserved for a future time slot but not yet occupied. |
| `"occupied"` | Currently in use by guests. |
| `"blocked"` | Administratively blocked — cannot be booked. |

---

## TypeScript Interfaces

Below are the complete TypeScript definitions for the schema. These can be used directly in consuming applications.

```typescript
// ─── Enumerations ────────────────────────────────────────────

type ElementType = 'table' | 'chair' | 'wall' | 'door' | 'window';

type Shape = 'rectangle' | 'round';

type Status = 'available' | 'reserved' | 'occupied' | 'blocked';

// ─── Primitives ──────────────────────────────────────────────

interface Point {
  /** X coordinate in world space */
  x: number;
  /** Y coordinate in world space */
  y: number;
}

// ─── Canvas ──────────────────────────────────────────────────

interface Canvas {
  /** Width of the canvas in world-coordinate pixels (> 0) */
  width: number;
  /** Height of the canvas in world-coordinate pixels (> 0) */
  height: number;
  /** Snap grid cell size in pixels (> 0) */
  gridSize: number;
}

// ─── Metadata ────────────────────────────────────────────────

interface BaseMetadata {
  /** Human-readable display label */
  label: string;
  /** Free-form extensibility object */
  custom: Record<string, unknown>;
}

interface TableMetadata extends BaseMetadata {
  /** Numeric table identifier */
  tableNumber: number;
  /** Maximum seating capacity (≥ 1) */
  capacity: number;
  /** Current booking status */
  status: Status;
  /** Active reservation ID, or null */
  reservationId: string | null;
  /** Time range for the reservation, or null */
  timeSlot: string | null;
}

interface ChairMetadata extends BaseMetadata {}

interface WallMetadata extends BaseMetadata {}

interface DoorMetadata extends BaseMetadata {
  /** Direction the door swings: "inward" | "outward" */
  swingDirection: string;
}

interface WindowMetadata extends BaseMetadata {}

interface GroupMetadata extends BaseMetadata {
  /** Numeric table identifier for the group */
  tableNumber: number;
  /** Total seating capacity of the group (≥ 1) */
  capacity: number;
  /** Current booking status */
  status: Status;
  /** Active reservation ID, or null */
  reservationId: string | null;
  /** Time range for the reservation, or null */
  timeSlot: string | null;
}

// ─── Elements ────────────────────────────────────────────────

/** Base fields shared by all box-type elements */
interface BoxElementBase {
  /** Globally unique identifier (UUID v4) */
  id: string;
  /** Visual shape of the element */
  shape: Shape;
  /** X position of the top-left corner in world coordinates */
  x: number;
  /** Y position of the top-left corner in world coordinates */
  y: number;
  /** Width of the bounding box in pixels (> 0) */
  width: number;
  /** Height of the bounding box in pixels (> 0) */
  height: number;
  /** Clockwise rotation in degrees (0–359) */
  rotation: number;
  /** Group ID for O(1) membership lookup, or null */
  groupId: string | null;
}

interface TableElement extends BoxElementBase {
  type: 'table';
  metadata: TableMetadata;
}

interface ChairElement extends BoxElementBase {
  type: 'chair';
  metadata: ChairMetadata;
}

interface WallElement {
  /** Globally unique identifier (UUID v4) */
  id: string;
  type: 'wall';
  /** Ordered vertices defining the wall polyline (≥ 2 points) */
  points: Point[];
  /** Stroke thickness in pixels (> 0) */
  thickness: number;
  metadata: WallMetadata;
}

interface DoorElement extends BoxElementBase {
  type: 'door';
  metadata: DoorMetadata;
}

interface WindowElement extends BoxElementBase {
  type: 'window';
  metadata: WindowMetadata;
}

/** Discriminated union of all element types */
type Element =
  | TableElement
  | ChairElement
  | WallElement
  | DoorElement
  | WindowElement;

// ─── Groups ──────────────────────────────────────────────────

interface Group {
  /** Globally unique identifier (UUID v4) */
  id: string;
  /** Ordered array of member element IDs (≥ 1) */
  elementIds: string[];
  /** Booking and display metadata */
  metadata: GroupMetadata;
}

// ─── Root Document ───────────────────────────────────────────

interface VenueLayout {
  /** Schema version string (currently "1.0") */
  version: string;
  /** Canvas dimensions and grid configuration */
  canvas: Canvas;
  /** All visual/spatial elements */
  elements: Element[];
  /** Logical groupings of elements */
  groups: Group[];
}
```

---

## Complete JSON Example

```json
{
  "version": "1.0",
  "canvas": {
    "width": 1200,
    "height": 800,
    "gridSize": 20
  },
  "elements": [
    {
      "id": "el_uuid",
      "type": "table",
      "shape": "rectangle",
      "x": 100,
      "y": 200,
      "width": 80,
      "height": 80,
      "rotation": 0,
      "groupId": "grp_uuid",
      "metadata": {
        "label": "Table 1",
        "tableNumber": 1,
        "capacity": 4,
        "status": "available",
        "reservationId": null,
        "timeSlot": null,
        "custom": {}
      }
    },
    {
      "id": "el_uuid2",
      "type": "chair",
      "shape": "rectangle",
      "x": 120,
      "y": 180,
      "width": 20,
      "height": 20,
      "rotation": 0,
      "groupId": "grp_uuid",
      "metadata": {
        "label": "Chair",
        "custom": {}
      }
    },
    {
      "id": "el_uuid3",
      "type": "wall",
      "points": [
        { "x": 0, "y": 0 },
        { "x": 400, "y": 0 },
        { "x": 400, "y": 300 }
      ],
      "thickness": 6,
      "metadata": {
        "label": "North Wall",
        "custom": {}
      }
    },
    {
      "id": "el_uuid4",
      "type": "door",
      "shape": "rectangle",
      "x": 200,
      "y": 0,
      "width": 40,
      "height": 6,
      "rotation": 0,
      "groupId": null,
      "metadata": {
        "label": "Main Entrance",
        "swingDirection": "inward",
        "custom": {}
      }
    },
    {
      "id": "el_uuid5",
      "type": "window",
      "shape": "rectangle",
      "x": 300,
      "y": 0,
      "width": 60,
      "height": 6,
      "rotation": 0,
      "groupId": null,
      "metadata": {
        "label": "Front Window",
        "custom": {}
      }
    }
  ],
  "groups": [
    {
      "id": "grp_uuid",
      "elementIds": ["el_uuid", "el_uuid2"],
      "metadata": {
        "label": "Table 1",
        "tableNumber": 1,
        "capacity": 4,
        "status": "available",
        "reservationId": null,
        "timeSlot": null,
        "custom": {}
      }
    }
  ]
}
```

---

## Relationships & Lookup Patterns

### Entity Relationship Diagram (Textual)

```
┌──────────────────────┐         ┌──────────────────────┐
│       Element         │         │        Group          │
├──────────────────────┤         ├──────────────────────┤
│ id            (PK)   │◄───┐    │ id            (PK)   │
│ type                  │    │    │ elementIds[]  (FK[]) │──┐
│ groupId       (FK)   │────┼───►│ metadata             │  │
│ ...                   │    │    └──────────────────────┘  │
└──────────────────────┘    │                               │
                            └───────────────────────────────┘
```

### Lookup Patterns

**1. Find which group an element belongs to:**
```typescript
// O(1) — direct field access
const group = element.groupId
  ? groups.find(g => g.id === element.groupId)
  : null;
```

**2. Find all elements in a group:**
```typescript
// O(n) where n = group size — iterate elementIds
const groupElements = group.elementIds.map(
  id => elements.find(el => el.id === id)
);
```

**3. Find all ungrouped tables (for booking):**
```typescript
const ungroupedTables = elements.filter(
  el => el.type === 'table' && el.groupId === null
);
```

**4. Build a full booking list (groups + ungrouped tables):**
```typescript
// Backend/Flutter booking logic only needs:
const bookableUnits = [
  ...groups.map(g => ({
    id: g.id,
    type: 'group' as const,
    ...g.metadata,
  })),
  ...elements
    .filter((el): el is TableElement =>
      el.type === 'table' && el.groupId === null
    )
    .map(el => ({
      id: el.id,
      type: 'table' as const,
      ...el.metadata,
    })),
];
```

**5. Build an element-to-group index for O(1) bulk lookups:**
```typescript
const elementToGroup = new Map<string, Group>();
for (const group of layout.groups) {
  for (const elementId of group.elementIds) {
    elementToGroup.set(elementId, group);
  }
}
// Usage: elementToGroup.get(someElement.id)
```

---

## Consumer Guide (Flutter / Backend)

### For Rendering (Flutter / Frontend)

1. Parse the JSON into the `VenueLayout` structure.
2. Use `canvas` to set up the viewport dimensions and zoom constraints.
3. Iterate `elements` and render each based on `type`:
   - **Box elements** (`table`, `chair`, `door`, `window`): draw at `(x, y)` with `width × height`, apply `rotation`.
   - **Polyline elements** (`wall`): draw connected line segments through `points[]` with `thickness`.
4. Use `element.groupId` to apply group-level styling (e.g., highlight all elements of a selected group).

### For Booking Logic (Backend)

1. **Ignore** rendering fields (`x`, `y`, `width`, `height`, `rotation`, `shape`, `points`, `thickness`).
2. Collect bookable units from:
   - `groups[]` — each group represents one bookable table unit with its `metadata.status`, `metadata.capacity`, etc.
   - Ungrouped `table` elements (where `groupId === null`) — each is independently bookable.
3. Update `status`, `reservationId`, and `timeSlot` on the relevant group or table metadata.
4. Write the updated JSON back to storage.

### Minimal Backend Payload

If bandwidth is a concern, backends can extract just what they need:

```typescript
interface BookableUnit {
  id: string;
  tableNumber: number;
  capacity: number;
  status: Status;
  reservationId: string | null;
  timeSlot: string | null;
}
```

---

## Schema Migration Strategy

The `version` field at the root of the document enables controlled schema evolution.

| Version | Description |
|---|---|
| `"1.0"` | Initial schema as documented here. |

### Migration Rules

1. **Read the `version` field first** before attempting to parse.
2. If `version` is older than expected, run a migration function:
   ```typescript
   function migrate(layout: unknown): VenueLayout {
     const raw = layout as { version: string };
     switch (raw.version) {
       case '1.0':
         return layout as VenueLayout; // current
       // Future:
       // case '1.0':
       //   return migrateV1toV2(layout);
       default:
         throw new Error(`Unknown schema version: ${raw.version}`);
     }
   }
   ```
3. **Additive changes** (new optional fields) should NOT require a version bump.
4. **Breaking changes** (renamed fields, removed fields, structural changes) MUST bump the version.

---

## Validation Rules

Consumers should validate imported JSON against these constraints:

### Document-Level

| Rule | Description |
|---|---|
| `version` is a non-empty string | Must match a known version. |
| `canvas.width > 0` | Canvas must have positive dimensions. |
| `canvas.height > 0` | Canvas must have positive dimensions. |
| `canvas.gridSize > 0` | Grid size must be positive. |
| `elements` is an array | May be empty. |
| `groups` is an array | May be empty. |

### Element-Level

| Rule | Description |
|---|---|
| `id` is unique across all elements | No duplicate element IDs. |
| `type` is a valid `ElementType` | Must be one of the defined types. |
| Box elements have all required box fields | `shape`, `x`, `y`, `width > 0`, `height > 0`, `rotation`, `groupId`. |
| Wall elements have `points.length >= 2` | A wall needs at least 2 vertices. |
| Wall elements have `thickness > 0` | Walls must have positive thickness. |
| `rotation` is in range `[0, 360)` | Normalized rotation value. |
| `groupId`, if non-null, references a valid group | Referential integrity. |

### Group-Level

| Rule | Description |
|---|---|
| `id` is unique across all groups | No duplicate group IDs. |
| `elementIds` is non-empty | A group must contain at least one element. |
| All IDs in `elementIds` reference existing elements | Referential integrity. |
| No element appears in multiple groups | An element can belong to at most one group. |
| `capacity >= 1` | A bookable group must seat at least one person. |
| `status` is a valid `Status` value | Must be one of the defined statuses. |

### Cross-Reference Integrity

```typescript
function validateIntegrity(layout: VenueLayout): string[] {
  const errors: string[] = [];
  const groupMap = new Map(layout.groups.map(g => [g.id, g]));
  const elementMap = new Map(layout.elements.map(e => [e.id, e]));
  const claimed = new Set<string>();

  // Validate element → group references
  for (const el of layout.elements) {
    if ('groupId' in el && el.groupId !== null) {
      if (!groupMap.has(el.groupId)) {
        errors.push(`Element "${el.id}" references non-existent group "${el.groupId}"`);
      }
    }
  }

  // Validate group → element references
  for (const group of layout.groups) {
    for (const elId of group.elementIds) {
      if (!elementMap.has(elId)) {
        errors.push(`Group "${group.id}" references non-existent element "${elId}"`);
      }
      if (claimed.has(elId)) {
        errors.push(`Element "${elId}" is claimed by multiple groups`);
      }
      claimed.add(elId);

      // Check bidirectional consistency
      const el = elementMap.get(elId);
      if (el && 'groupId' in el && el.groupId !== group.id) {
        errors.push(`Element "${elId}" has groupId "${el.groupId}" but is listed in group "${group.id}"`);
      }
    }
  }

  return errors;
}
```

---

## FAQ

### Why do both elements and groups carry booking metadata?

The **group** is the authoritative source for booking state. Table elements carry metadata fields like `status` and `reservationId` for convenience when tables are **ungrouped** (not part of any group). When a table is grouped, consumers should read booking state from the **group's** metadata.

### Why use `groupId` on elements instead of just scanning groups?

Performance. With `groupId` on each element, consumers can determine group membership in O(1) without scanning the entire `groups` array. This is critical for interactive rendering where hover/click events need instant feedback.

### Can a wall be part of a group?

No. Walls are structural elements and do not participate in the grouping system. They have no `groupId` field.

### Can an element belong to multiple groups?

No. An element can belong to **at most one** group. This is enforced by the single `groupId` field on elements and validated by the integrity check.

### How should I handle the `custom` field?

The `custom` object is a free-form `Record<string, unknown>` for domain-specific extensions. Examples:
- `{ "color": "#FF5733" }` — custom element color
- `{ "floor": 2 }` — multi-floor venue indicator
- `{ "minSpend": 500 }` — minimum spend for a VIP table
- `{ "accessible": true }` — accessibility flag

The builder preserves `custom` data through round-trips without modification.

### What coordinate system is used?

All positions use **world coordinates** with the origin `(0, 0)` at the top-left of the canvas. X increases rightward, Y increases downward. There is no concept of screen coordinates in the schema — consumers handle their own pan/zoom transforms.

### How do I render a round table?

When `shape === "round"`, render a circle (if `width === height`) or ellipse inscribed within the `width × height` bounding box, centered at `(x + width/2, y + height/2)`.

---

*This document is the canonical reference for the `venue-builder` data model. All consumers — Flutter apps, backend services, third-party integrations — should conform to this schema.*
