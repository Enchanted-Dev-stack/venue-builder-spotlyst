/**
 * Snaps a value to the nearest grid increment.
 */
export declare function snapToGrid(value: number, gridSize: number): number;
/**
 * Calculates the Euclidean distance between two points.
 */
export declare function distance(x1: number, y1: number, x2: number, y2: number): number;
/**
 * Tests whether a point (px, py) lies inside a rectangle defined by (x, y, w, h).
 */
export declare function pointInRect(px: number, py: number, x: number, y: number, w: number, h: number): boolean;
/**
 * Tests whether a point (px, py) lies inside a circle defined by center (cx, cy) and radius r.
 */
export declare function pointInCircle(px: number, py: number, cx: number, cy: number, r: number): boolean;
/**
 * Calculates the perpendicular distance from a point (px, py) to the
 * line segment defined by (x1, y1) → (x2, y2).
 */
export declare function pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number;
/**
 * Clamps a value between a minimum and maximum.
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Tests whether two axis-aligned bounding boxes intersect.
 */
export declare function rectIntersectsRect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean;
/**
 * Computes the axis-aligned bounding box for an array of points.
 */
export declare function getBoundingBox(points: {
    x: number;
    y: number;
}[]): {
    x: number;
    y: number;
    width: number;
    height: number;
};
