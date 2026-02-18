<p align="center">
  <img src="docs/assets/logo.svg" alt="venue-builder" width="120" />
</p>

<h1 align="center">venue-builder</h1>

<p align="center">
  <strong>Interactive Canvas 2D venue floor plan builder for the web.</strong><br/>
  Design restaurant, café, and hospitality layouts — then export clean JSON for any backend.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/venue-builder"><img src="https://img.shields.io/npm/v/venue-builder?color=0284c7&label=npm" alt="npm version" /></a>
  <a href="https://github.com/your-org/venue-builder/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/venue-builder?color=22c55e" alt="license" /></a>
  <a href="https://bundlephobia.com/package/venue-builder"><img src="https://img.shields.io/bundlephobia/minzip/venue-builder?color=8b5cf6&label=bundle" alt="bundle size" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero dependencies" />
  <img src="https://img.shields.io/badge/types-included-blue" alt="TypeScript" />
</p>

---

## Overview

**venue-builder** is a zero-dependency, standalone TypeScript library that renders a fully interactive venue floor plan editor on an HTML Canvas 2D surface. It uses a clean, top-down 2D flat minimal design — a light/white canvas workspace paired with a dark sidebar toolbar — purpose-built for restaurants, cafés, bars, co-working spaces, and similar hospitality venues.

Design your floor plan visually, group elements into bookable units, manage booking states with color-coded indicators, and export everything as portable JSON ready for any database or backend.

> **Flutter / mobile?** — venue-builder runs in the browser for _editing_. The exported JSON schema can be consumed separately by Flutter, React Native, or any other client to _render_ the layout read-only. See [docs/flutter-integration.md](docs/flutter-integration.md).

---

## Features

### 🏗️ Floor Plan Elements
- **Tables** — round and rectangular, with configurable size and capacity
- **Chairs** — auto-attach to tables or place freely
- **Walls** — draw structural walls and partitions
- **Doors** — single, double, and sliding variants
- **Windows** — place along walls with adjustable width

### 🔗 Grouping & Booking
- **Grouping** — combine tables + chairs into a single bookable unit
- **4-state booking system** — `available` · `reserved` · `occupied` · `blocked`
- **Color-coded status** — instant visual feedback per unit (green / amber / red / grey)
- **Capacity metadata** — attach min/max guest counts to each group

### 🎨 Editor Experience
- **Snap-to-grid** — pixel-perfect alignment with configurable grid size
- **Zoom & pan** — scroll-wheel zoom + click-drag panning
- **Undo / redo** — full history stack (Ctrl+Z / Ctrl+Shift+Z)
- **Dark sidebar** — element palette, properties panel, and layer controls
- **Light canvas** — clean white workspace with subtle grid lines
- **Multi-select** — box-select or Shift+click to manipulate multiple elements
- **Keyboard shortcuts** — delete, duplicate, rotate, and more

### 📦 Developer Experience
- **Zero dependencies** — nothing to install alongside it
- **TypeScript-first** — full `.d.ts` declarations included
- **ESM + UMD bundles** — `import`, `require()`, or drop in a `<script>` tag
- **JSON import / export** — serialize the entire venue to a plain object
- **Framework-agnostic** — works with React, Vue, Angular, Svelte, plain HTML, etc.
- **Headless mode** — programmatically build layouts without rendering (SSR-safe)

---

## Quick Start

### Installation

```bash
npm install venue-builder
```

```bash
# or with your preferred package manager
yarn add venue-builder
pnpm add venue-builder
```

### Plain HTML

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

  <script src="https://unpkg.com/venue-builder/dist/venue-builder.umd.js"></script>
  <script>
    const builder = new VenueBuilder.create('#editor', {
      width: 1200,
      height: 800,
      gridSize: 20,
      theme: 'light',          // canvas theme
      sidebarTheme: 'dark',    // dark sidebar toolbar
    });

    // Add a round table with 4 chairs
    const table = builder.addTable({ type: 'round', x: 300, y: 250, radius: 40 });
    builder.addChairs(table.id, { count: 4 });

    // Group into a bookable unit
    builder.createGroup({
      name: 'Table 1',
      elements: [table.id],
      capacity: { min: 1, max: 4 },
      status: 'available',
    });

    // Export JSON
    const json = builder.exportJSON();
    console.log(json);
  </script>
</body>
</html>
```

### React

```tsx
import { useRef, useEffect } from 'react';
import { create, type VenueBuilderInstance } from 'venue-builder';

export default function VenueEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const builderRef = useRef<VenueBuilderInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    builderRef.current = create(containerRef.current, {
      width: 1200,
      height: 800,
      gridSize: 20,
    });

    return () => builderRef.current?.destroy();
  }, []);

  const handleSave = () => {
    const json = builderRef.current?.exportJSON();
    // POST to your API, save to database, etc.
    fetch('/api/venues/1/layout', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json),
    });
  };

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '80vh' }} />
      <button onClick={handleSave}>Save Layout</button>
    </div>
  );
}
```

### Loading an Existing Layout

```ts
import { create } from 'venue-builder';

const builder = create('#editor');

// Load from your API / database
const saved = await fetch('/api/venues/1/layout').then(r => r.json());
builder.importJSON(saved);
```

---

## JSON Output Format

`exportJSON()` returns a self-contained object describing the full venue layout. Store it as-is in any document database, relational JSON column, or flat file.

```jsonc
{
  "version": "1.0.0",
  "canvas": {
    "width": 1200,
    "height": 800,
    "gridSize": 20
  },
  "elements": [
    {
      "id": "tbl_01H8A...",
      "type": "table",
      "shape": "round",
      "x": 300,
      "y": 250,
      "radius": 40,
      "rotation": 0,
      "label": "T1"
    },
    {
      "id": "chr_01H8B...",
      "type": "chair",
      "x": 300,
      "y": 200,
      "attachedTo": "tbl_01H8A..."
    },
    {
      "id": "wall_01H8C...",
      "type": "wall",
      "x1": 0, "y1": 0,
      "x2": 1200, "y2": 0,
      "thickness": 8
    }
    // ... more elements
  ],
  "groups": [
    {
      "id": "grp_01H8D...",
      "name": "Table 1",
      "elementIds": ["tbl_01H8A...", "chr_01H8B..."],
      "capacity": { "min": 1, "max": 4 },
      "status": "available"   // "available" | "reserved" | "occupied" | "blocked"
    }
  ],
  "metadata": {
    "venueName": "The Garden Bistro",
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T14:22:00Z"
  }
}
```

### Booking Status States

| Status        | Color   | Description                        |
| ------------- | ------- | ---------------------------------- |
| `available`   | 🟢 Green  | Open for new reservations       |
| `reserved`    | 🟡 Amber  | Booked for an upcoming guest    |
| `occupied`    | 🔴 Red    | Currently in use                |
| `blocked`     | ⚫ Grey   | Temporarily unavailable         |

Update statuses at runtime:

```ts
builder.setGroupStatus('grp_01H8D...', 'reserved');
```

---

## API at a Glance

| Method | Description |
| --- | --- |
| `create(el, options?)` | Mount the editor to a DOM element |
| `destroy()` | Tear down the editor and free resources |
| `addTable(props)` | Add a round or rectangular table |
| `addChairs(tableId, props)` | Attach chairs to a table |
| `addWall(props)` | Draw a wall segment |
| `addDoor(props)` | Place a door on a wall |
| `addWindow(props)` | Place a window on a wall |
| `createGroup(props)` | Group elements into a bookable unit |
| `setGroupStatus(id, status)` | Update booking status |
| `exportJSON()` | Serialize layout to JSON |
| `importJSON(data)` | Load a layout from JSON |
| `undo()` / `redo()` | Navigate the history stack |
| `zoomTo(level)` | Set zoom level programmatically |
| `on(event, handler)` | Subscribe to editor events |

> Full API reference → [docs/api-reference.md](docs/api-reference.md)

---

## Documentation

Detailed guides and references live in the [`docs/`](docs/) folder:

| Document | Description |
| --- | --- |
| [Getting Started](docs/getting-started.md) | Installation, first layout, core concepts |
| [API Reference](docs/api-reference.md) | Complete method & type documentation |
| [Configuration](docs/configuration.md) | All editor options and theming |
| [Elements Guide](docs/elements.md) | Tables, chairs, walls, doors, windows |
| [Grouping & Booking](docs/grouping-and-booking.md) | Bookable units and status management |
| [JSON Schema](docs/json-schema.md) | Full export format specification |
| [Framework Examples](docs/frameworks.md) | React, Vue, Angular, Svelte recipes |
| [Flutter Integration](docs/flutter-integration.md) | Consuming JSON output in Flutter |
| [Keyboard Shortcuts](docs/shortcuts.md) | All available hotkeys |

---

## Browser Support

| Browser | Version |
| --- | --- |
| Chrome | 80+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 80+ |

Canvas 2D is required. No WebGL dependency.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

```bash
git clone https://github.com/your-org/venue-builder.git
cd venue-builder
npm install
npm run dev       # start dev server with hot reload
npm run test      # run test suite
npm run build     # produce ESM + UMD bundles
```

---

## License

[MIT](LICENSE) © 2025 venue-builder contributors
