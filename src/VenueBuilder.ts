import { Camera, Grid, ElementManager, SelectionManager, HistoryManager, GroupManager, FloorManager } from './core';
import { InteractionManager } from './core/InteractionManager';
import { EventEmitter } from './events/EventEmitter';
import { Serializer } from './serializer/Serializer';
import { SelectTool } from './tools/SelectTool';
import { AddElementTool } from './tools/AddElementTool';
import { WallTool } from './tools/WallTool';
import { ToolContext } from './tools/BaseTool';
import { BaseElement } from './elements/BaseElement';
import { COLORS } from './theme/colors';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, DEFAULT_GRID_SIZE } from './utils/constants';
import {
  VenueBuilderOptions, ToolType, ElementData, LayoutData, GroupData,
  BuilderEvent, TableShape, FloorData, FloorAreaType
} from './core/types';

export class VenueBuilder {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private grid: Grid;
  private elementManager: ElementManager;
  private selectionManager: SelectionManager;
  private historyManager: HistoryManager;
  private groupManager: GroupManager;
  private floorManager: FloorManager;
  private interactionManager: InteractionManager;
  private emitter: EventEmitter<BuilderEvent>;
  private options: Required<VenueBuilderOptions>;
  private dirty: boolean = true;
  private animFrameId: number = 0;
  private currentToolType: ToolType = 'select';
  private resizeObserver: ResizeObserver | null = null;
  private boundDeleteHandler: () => void;
  private boundUndoHandler: () => void;
  private boundRedoHandler: () => void;

  constructor(container: HTMLElement, options?: VenueBuilderOptions) {
    // Set options with defaults
    this.options = {
      width: options?.width ?? DEFAULT_CANVAS_WIDTH,
      height: options?.height ?? DEFAULT_CANVAS_HEIGHT,
      gridSize: options?.gridSize ?? DEFAULT_GRID_SIZE,
      mode: options?.mode ?? 'edit',
      showGrid: options?.showGrid ?? true,
      snapToGrid: options?.snapToGrid ?? true,
    };

    this.container = container;
    this.emitter = new EventEmitter();
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.tabIndex = 0;
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    // Initialize core modules
    this.camera = new Camera();
    this.grid = new Grid(this.options.gridSize);
    this.elementManager = new ElementManager();
    this.selectionManager = new SelectionManager();
    this.historyManager = new HistoryManager();
    this.groupManager = new GroupManager();
    this.floorManager = new FloorManager();

    // Create the default floor
    this.floorManager.createFloor('Floor 1', 'floor');

    // Initialize interaction manager
    this.interactionManager = new InteractionManager(this.canvas, this.camera, () => this.markDirty());

    // Bind custom event handlers for keyboard shortcuts
    this.boundDeleteHandler = () => this.deleteSelected();
    this.boundUndoHandler = () => this.undo();
    this.boundRedoHandler = () => this.redo();
    this.canvas.addEventListener('venue:deleteSelected', this.boundDeleteHandler);
    this.canvas.addEventListener('venue:undo', this.boundUndoHandler);
    this.canvas.addEventListener('venue:redo', this.boundRedoHandler);

    // Set initial tool
    this.setTool('select');

    // Handle canvas resize
    this.setupResizeObserver();

    // Bind interaction events
    this.interactionManager.bind();

    // Save initial history state
    this.saveHistory();

    // Start render loop
    this.startRenderLoop();
  }

  // === Public API ===

  addElement(data: Partial<ElementData> & { type: string }): BaseElement {
    const element = this.elementManager.createFromData(data);
    this.saveHistory();
    this.emitter.emit('elementAdded', { element: element.toData() });
    this.emitter.emit('layoutChanged', { layout: this.toJSON() });
    this.markDirty();
    return element;
  }

  removeElement(id: string): void {
    const element = this.elementManager.remove(id);
    if (element) {
      this.selectionManager.deselect(id);
      this.saveHistory();
      this.emitter.emit('elementRemoved', { element: element.toData() });
      this.emitter.emit('layoutChanged', { layout: this.toJSON() });
      this.markDirty();
    }
  }

  updateElement(id: string, updates: Partial<ElementData>): void {
    const element = this.elementManager.get(id);
    if (element) {
      element.updateFromData(updates);
      this.saveHistory();
      this.emitter.emit('elementUpdated', { element: element.toData(), changes: updates });
      this.markDirty();
    }
  }

  addElementSilent(data: Partial<ElementData> & { type: string }): BaseElement {
    const element = this.elementManager.createFromData(data);
    this.markDirty();
    return element;
  }

  removeElementSilent(id: string): void {
    const element = this.elementManager.remove(id);
    if (element) {
      this.selectionManager.deselect(id);
      this.markDirty();
    }
  }

  setTool(toolType: ToolType, config?: { shape?: TableShape }): void {
    const toolContext: ToolContext = {
      camera: this.camera,
      elementManager: this.elementManager,
      selectionManager: this.selectionManager,
      groupManager: this.groupManager,
      canvas: this.canvas,
      gridSize: this.options.gridSize,
      snapToGrid: this.options.snapToGrid,
      onStateChanged: () => {
        this.saveHistory();
        this.emitter.emit('layoutChanged', { layout: this.toJSON() });
        this.markDirty();
      },
    };

    let tool;
    switch (toolType) {
      case 'select':
        tool = new SelectTool(toolContext);
        break;
      case 'addTable':
        tool = new AddElementTool(toolContext, 'table', config);
        break;
      case 'addChair':
        tool = new AddElementTool(toolContext, 'chair');
        break;
      case 'addWall':
        tool = new WallTool(toolContext);
        break;
      case 'addDoor':
        tool = new AddElementTool(toolContext, 'door');
        break;
      case 'addWindow':
        tool = new AddElementTool(toolContext, 'window');
        break;
      case 'addPlant':
        tool = new AddElementTool(toolContext, 'plant');
        break;
      case 'addCounter':
        tool = new AddElementTool(toolContext, 'counter');
        break;
      case 'addBooth':
        tool = new AddElementTool(toolContext, 'booth');
        break;
      case 'addDivider':
        tool = new AddElementTool(toolContext, 'divider');
        break;
      case 'addBar':
        tool = new AddElementTool(toolContext, 'bar');
        break;
      case 'addLamp':
        tool = new AddElementTool(toolContext, 'lamp');
        break;
    }

    this.interactionManager.setTool(tool);
    this.currentToolType = toolType;
    this.emitter.emit('toolChanged', { tool: toolType });
    this.markDirty();
  }

  getToolType(): ToolType { return this.currentToolType; }

  toJSON(): LayoutData {
    // Save current canvas state into the active floor first
    this.floorManager.saveFloorState(
      this.elementManager.toData(),
      this.groupManager.toData(),
    );

    const { floors, activeFloorId } = this.floorManager.toData();

    return Serializer.serialize(
      this.elementManager.toData(),
      this.groupManager.toData(),
      { width: this.options.width, height: this.options.height, gridSize: this.options.gridSize },
      floors,
      activeFloorId,
    );
  }

  loadJSON(data: LayoutData): void {
    const { elements, groups, canvas, floors, activeFloorId } = Serializer.deserialize(data);

    // Load floors if present
    if (floors && floors.length > 0) {
      this.floorManager.loadFromData(floors, activeFloorId);
      // Load the active floor's data into the canvas
      const active = this.floorManager.getActiveFloor();
      if (active) {
        this.elementManager.loadFromData(active.elements);
        this.groupManager.loadFromData(active.groups);
      }
    } else {
      // Legacy single-floor data — put everything into the default floor
      this.floorManager.clear();
      const floor = this.floorManager.createFloor('Floor 1', 'floor');
      floor.elements = elements;
      floor.groups = groups;
      this.elementManager.loadFromData(elements);
      this.groupManager.loadFromData(groups);
    }

    if (canvas) {
      this.options.width = canvas.width;
      this.options.height = canvas.height;
      this.options.gridSize = canvas.gridSize;
      this.grid = new Grid(canvas.gridSize);
    }
    this.selectionManager.clearSelection();
    this.historyManager.clear();
    this.saveHistory();
    this.markDirty();
  }

  groupSelected(): GroupData | null {
    const selectedIds = this.selectionManager.getSelectedIds();
    return this.groupElementsByIds(selectedIds);
  }

  groupElementsByIds(ids: string[], options?: { autoRotate?: boolean }): GroupData | null {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length < 2) return null;
    const elements = uniqueIds.map(id => this.elementManager.get(id)).filter(Boolean) as BaseElement[];
    if (elements.length < 2) return null;
    const group = this.groupManager.createGroup(elements);

    if (options?.autoRotate !== false) {
      this.autoRotateChairsAroundTable(elements);
    }

    this.selectionManager.clearSelection();
    for (const el of elements) {
      this.selectionManager.addToSelection(el);
    }

    this.saveHistory();
    this.emitter.emit('groupCreated', { group });
    this.markDirty();
    return group;
  }

  private autoRotateChairsAroundTable(elements: BaseElement[]): void {
    const roundTable = elements.find(
      (el) => el.type === 'table' && el.metadata.shape === 'round'
    );
    if (!roundTable) return;

    const tableCx = roundTable.x + roundTable.width / 2;
    const tableCy = roundTable.y + roundTable.height / 2;
    const tableRadius = Math.min(roundTable.width, roundTable.height) / 2;
    const chairs = elements.filter((el) => el.type === 'chair');
    if (chairs.length === 0) return;

    const MIN_GAP = 10;
    const angleStep = (2 * Math.PI) / chairs.length;
    const startAngle = -Math.PI / 2;

    for (let i = 0; i < chairs.length; i++) {
      const chair = chairs[i];
      const chairHalf = Math.max(chair.width, chair.height) / 2;
      const dist = tableRadius + chairHalf + MIN_GAP;
      const angle = startAngle + i * angleStep;

      const newCx = tableCx + dist * Math.cos(angle);
      const newCy = tableCy + dist * Math.sin(angle);
      chair.moveTo(
        Math.round(newCx - chair.width / 2),
        Math.round(newCy - chair.height / 2),
      );

      const angleDeg = angle * (180 / Math.PI) + 90;
      chair.rotation = Math.round(angleDeg);
    }
  }

  ungroupSelected(): void {
    const selectedIds = this.selectionManager.getSelectedIds();
    for (const id of selectedIds) {
      const el = this.elementManager.get(id);
      if (el?.groupId) {
        const group = this.groupManager.getGroup(el.groupId);
        if (group) {
          this.groupManager.removeGroup(group.id, this.elementManager.getAll());
          this.emitter.emit('groupRemoved', { group });
        }
      }
    }
    this.saveHistory();
    this.markDirty();
  }

  undo(): void {
    const state = this.historyManager.undo();
    if (state) {
      this.elementManager.loadFromData(state.elements);
      this.groupManager.loadFromData(state.groups);
      this.selectionManager.clearSelection();
      this.markDirty();
    }
  }

  redo(): void {
    const state = this.historyManager.redo();
    if (state) {
      this.elementManager.loadFromData(state.elements);
      this.groupManager.loadFromData(state.groups);
      this.selectionManager.clearSelection();
      this.markDirty();
    }
  }

  on<K extends keyof BuilderEvent>(event: K, callback: (data: BuilderEvent[K]) => void): () => void {
    return this.emitter.on(event, callback);
  }

  getElements(): ElementData[] { return this.elementManager.toData(); }

  getGroups(): GroupData[] { return this.groupManager.toData(); }

  getSelectedElements(): ElementData[] {
    return this.selectionManager.getSelectedIds()
      .map(id => this.elementManager.get(id))
      .filter(Boolean)
      .map(el => (el as BaseElement).toData());
  }

  destroy(): void {
    cancelAnimationFrame(this.animFrameId);
    this.interactionManager.unbind();
    this.emitter.removeAllListeners();
    this.canvas.removeEventListener('venue:deleteSelected', this.boundDeleteHandler);
    this.canvas.removeEventListener('venue:undo', this.boundUndoHandler);
    this.canvas.removeEventListener('venue:redo', this.boundRedoHandler);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }

  /** Show or hide the background grid. */
  setShowGrid(show: boolean): void {
    this.options.showGrid = show;
    this.markDirty();
  }

  /** Returns whether the grid is currently visible. */
  getShowGrid(): boolean {
    return this.options.showGrid;
  }

  // === Floor / Area API ===

  /** Add a new floor or area. Returns the created FloorData. */
  addFloor(name: string, type: FloorAreaType = 'floor'): FloorData {
    const floor = this.floorManager.createFloor(name, type);
    this.emitter.emit('floorAdded', { floor });
    return floor;
  }

  /** Remove a floor/area by id. Cannot remove the last remaining floor. */
  removeFloor(floorId: string): boolean {
    const floor = this.floorManager.getFloor(floorId);
    if (!floor) return false;
    const wasActive = this.floorManager.getActiveFloorId() === floorId;
    const removed = this.floorManager.removeFloor(floorId);
    if (!removed) return false;

    this.emitter.emit('floorRemoved', { floor });

    // If we just removed the active floor, load the new active floor
    if (wasActive) {
      const newActive = this.floorManager.getActiveFloor();
      if (newActive) {
        this.loadFloorIntoCanvas(newActive);
        this.emitter.emit('floorChanged', { floor: newActive });
      }
    }
    return true;
  }

  /** Switch to a different floor/area. Saves current state first. */
  switchFloor(floorId: string): boolean {
    if (floorId === this.floorManager.getActiveFloorId()) return true;

    // Save current canvas into the outgoing floor
    this.floorManager.saveFloorState(
      this.elementManager.toData(),
      this.groupManager.toData(),
    );

    const floor = this.floorManager.switchFloor(floorId);
    if (!floor) return false;

    this.loadFloorIntoCanvas(floor);
    this.emitter.emit('floorChanged', { floor });
    return true;
  }

  /** Rename a floor/area. */
  renameFloor(floorId: string, name: string): void {
    this.floorManager.renameFloor(floorId, name);
    const floor = this.floorManager.getFloor(floorId);
    if (floor) this.emitter.emit('floorRenamed', { floor });
  }

  /** Get all floors/areas in order. */
  getFloors(): FloorData[] {
    // Make sure the active floor has the latest canvas state
    this.floorManager.saveFloorState(
      this.elementManager.toData(),
      this.groupManager.toData(),
    );
    return this.floorManager.getOrderedFloors();
  }

  /** Get the currently active floor id. */
  getActiveFloorId(): string {
    return this.floorManager.getActiveFloorId();
  }

  // === Booking API ===

  /**
   * Bulk-apply bookings to all bookable elements on the *current* floor.
   *
   * Each entry identifies a table/booth by `elementId` **or** `tableNumber`
   * and sets its status, customer name, and time window.  Elements not
   * mentioned in the array are reset to `available` with no customer.
   *
   * This is the main method front-end apps should call when the time slot
   * changes — pass the bookings that overlap the current time and the
   * canvas will update instantly.
   */
  applyBookings(bookings: Array<{
    elementId?: string;
    tableNumber?: number;
    status: 'available' | 'reserved' | 'occupied' | 'blocked';
    customerName?: string;
    bookingStart?: string;
    bookingEnd?: string;
    reservationId?: string;
  }>): void {
    const elements = this.elementManager.getAll();
    const bookableTypes = new Set(['table', 'booth']);

    // Build lookup maps for fast matching
    const byId = new Map<string, typeof bookings[0]>();
    const byTableNum = new Map<number, typeof bookings[0]>();
    for (const b of bookings) {
      if (b.elementId) byId.set(b.elementId, b);
      if (b.tableNumber != null) byTableNum.set(b.tableNumber, b);
    }

    for (const el of elements) {
      if (!bookableTypes.has(el.type)) continue;

      // Try to match by elementId first, then by tableNumber
      let booking = byId.get(el.id);
      if (!booking && el.metadata.tableNumber != null) {
        booking = byTableNum.get(el.metadata.tableNumber as number);
      }

      if (booking) {
        el.metadata.status = booking.status;
        el.metadata.customerName = booking.customerName || '';
        el.metadata.bookingStart = booking.bookingStart || '';
        el.metadata.bookingEnd = booking.bookingEnd || '';
        el.metadata.reservationId = booking.reservationId || '';
      } else {
        // Reset to available
        el.metadata.status = 'available';
        el.metadata.customerName = '';
        el.metadata.bookingStart = '';
        el.metadata.bookingEnd = '';
        el.metadata.reservationId = '';
      }
    }

    this.markDirty();
  }

  /**
   * Update a single element's booking state. Convenience wrapper around
   * `updateElement` that only touches booking-related metadata keys.
   */
  setBooking(
    elementId: string,
    booking: {
      status: 'available' | 'reserved' | 'occupied' | 'blocked';
      customerName?: string;
      bookingStart?: string;
      bookingEnd?: string;
      reservationId?: string;
    },
  ): void {
    const el = this.elementManager.get(elementId);
    if (!el) return;
    el.metadata.status = booking.status;
    el.metadata.customerName = booking.customerName ?? '';
    el.metadata.bookingStart = booking.bookingStart ?? '';
    el.metadata.bookingEnd = booking.bookingEnd ?? '';
    el.metadata.reservationId = booking.reservationId ?? '';
    this.emitter.emit('elementUpdated', {
      element: el.toData(),
      changes: { metadata: el.metadata },
    });
    this.markDirty();
  }

  // === Private Methods ===

  private loadFloorIntoCanvas(floor: FloorData): void {
    this.elementManager.loadFromData(floor.elements);
    this.groupManager.loadFromData(floor.groups);
    this.selectionManager.clearSelection();
    this.historyManager.clear();
    this.saveHistory();
    this.markDirty();
  }

  private deleteSelected(): void {
    const selectedIds = this.selectionManager.getSelectedIds();
    for (const id of selectedIds) {
      this.removeElement(id);
    }
  }

  private markDirty(): void { this.dirty = true; }

  private saveHistory(): void {
    this.historyManager.push({
      elements: this.elementManager.toData(),
      groups: this.groupManager.toData(),
    });
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.markDirty();
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private startRenderLoop(): void {
    const render = () => {
      if (this.dirty) {
        this.render();
        this.dirty = false;
      }
      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  private render(): void {
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;
    
    // Clear canvas with DPR scaling
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.fillStyle = COLORS.canvas.background;
    this.ctx.fillRect(0, 0, width, height);

    // Draw grid (passes DPR through to camera transform)
    if (this.options.showGrid) {
      this.grid.draw(this.ctx, this.camera, width, height, dpr);
    }

    // Apply camera transform with DPR
    this.camera.applyTransform(this.ctx, dpr);

    // Draw group outlines (behind elements)
    this.groupManager.drawGroupOutlines(this.ctx, this.elementManager.getAll());

    // Draw elements
    const elements = this.elementManager.getAll();

    // Propagate table booking status colors to grouped chairs
    for (const el of elements) {
      if (el.type === 'chair') {
        delete el.metadata._statusColor;
      }
    }
    for (const group of this.groupManager.getAllGroups()) {
      const members = this.groupManager.getGroupElements(group.id, elements);
      const table = members.find((el) => el.type === 'table');
      if (!table) continue;
      const status = table.metadata.status as string;
      if (!status || !(status in COLORS.status)) continue;
      const colors = COLORS.status[status as keyof typeof COLORS.status];
      for (const el of members) {
        if (el.type === 'chair') {
          el.metadata._statusColor = {
            fill: colors.fill,
            stroke: colors.stroke,
            blocked: status === 'blocked',
          };
        }
      }
    }

    for (const element of elements) {
      const isSelected = this.selectionManager.isSelected(element.id);
      const isHovered = this.selectionManager.isHovered(element.id);
      element.draw(this.ctx, isSelected, isHovered);
    }

    // Draw selection handles on top
    this.selectionManager.drawSelection(this.ctx, elements);

    // Draw tool previews (wall preview line, element ghost, etc)
    this.drawToolPreviews();
  }

  private drawToolPreviews(): void {
    const tool = this.interactionManager.getTool();
    if (!tool) return;

    // Wall tool preview
    if (tool instanceof WallTool) {
      const preview = tool.getCurrentWallPreview();
      if (preview && preview.points.length > 0) {
        this.ctx.save();
        this.ctx.strokeStyle = COLORS.elements.wallStroke;
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.setLineDash([8, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(preview.points[0].x, preview.points[0].y);
        for (let i = 1; i < preview.points.length; i++) {
          this.ctx.lineTo(preview.points[i].x, preview.points[i].y);
        }
        if (preview.previewPoint) {
          this.ctx.lineTo(preview.previewPoint.x, preview.previewPoint.y);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        // Draw dots at placed points
        this.ctx.fillStyle = COLORS.ui.primary;
        for (const pt of preview.points) {
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }
    }

    // Add element tool preview
    if (tool instanceof AddElementTool) {
      const preview = tool.getPreview();
      if (preview) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        let w: number, h: number;
        switch (preview.type) {
          case 'chair': w = 30; h = 30; break;
          case 'table': w = 80; h = 80; break;
          case 'door': w = 40; h = 10; break;
          case 'window': w = 60; h = 10; break;
          case 'plant': w = 40; h = 40; break;
          case 'counter': w = 140; h = 50; break;
          case 'booth': w = 100; h = 70; break;
          case 'divider': w = 80; h = 8; break;
          case 'bar': w = 160; h = 40; break;
          case 'lamp': w = 30; h = 30; break;
          default: w = 60; h = 60;
        }
        this.ctx.fillStyle = COLORS.ui.primary;
        this.ctx.beginPath();
        this.ctx.roundRect(preview.x - w/2, preview.y - h/2, w, h, 8);
        this.ctx.fill();
        this.ctx.restore();
      }
    }
  }
}
