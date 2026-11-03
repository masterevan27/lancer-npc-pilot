// Complete rigid translation of a native polygon: start/end interiors plus
// every boundary edge's swept quadrilateral. No size-based shape approximation.
const EPS = 1e-7;
const cross = (a, b) => a.x * b.y - a.y * b.x;
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const point = p => p && Number.isFinite(p.x) && Number.isFinite(p.y);

function location(p, polygon) {
  let inside = false;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    if (Math.abs(cross(sub(b, a), sub(p, a))) <= EPS
      && p.x >= Math.min(a.x, b.x) - EPS && p.x <= Math.max(a.x, b.x) + EPS
      && p.y >= Math.min(a.y, b.y) - EPS && p.y <= Math.max(a.y, b.y) + EPS) return 1;
    if ((a.y > p.y) !== (b.y > p.y) && p.x < a.x + (b.x - a.x) * (p.y - a.y) / (b.y - a.y)) inside = !inside;
  }
  return inside ? 2 : 0;
}

/** True only if a nonzero part of the wall enters the swept body's interior. */
export function segmentEntersSweep(a, b, polygon, delta) {
  if (!point(a) || !point(b) || !point(delta) || !Array.isArray(polygon) || polygon.length < 3
    || polygon.length > 256 || Array.from(polygon).some(p => !point(p))) throw Error('Native swept polygon is unavailable.');
  if ((!delta.x && !delta.y) || (a.x === b.x && a.y === b.y)) return false;
  const xs = polygon.map(p => p.x), ys = polygon.map(p => p.y);
  if (Math.max(a.x, b.x) <= Math.min(...xs) + Math.min(0, delta.x)
    || Math.min(a.x, b.x) >= Math.max(...xs) + Math.max(0, delta.x)
    || Math.max(a.y, b.y) <= Math.min(...ys) + Math.min(0, delta.y)
    || Math.min(a.y, b.y) >= Math.max(...ys) + Math.max(0, delta.y)) return false;
  const end = polygon.map(p => ({ x: p.x + delta.x, y: p.y + delta.y }));
  const polygons = [polygon, end, ...polygon.map((p, i) => [p, polygon[(i + 1) % polygon.length], end[(i + 1) % polygon.length], end[i]])];
  const r = sub(b, a), length2 = r.x * r.x + r.y * r.y, cuts = [0, 1];
  const add = t => { if (t >= -EPS && t <= 1 + EPS) cuts.push(Math.max(0, Math.min(1, t))); };
  for (const shape of polygons) for (let i = 0; i < shape.length; i++) {
    const c = shape[i], d = shape[(i + 1) % shape.length], s = sub(d, c), ca = sub(c, a), denominator = cross(r, s);
    if (Math.abs(denominator) > EPS) {
      const u = cross(ca, r) / denominator;
      if (u >= -EPS && u <= 1 + EPS) add(cross(ca, s) / denominator);
    } else if (Math.abs(cross(ca, r)) <= EPS) {
      add((ca.x * r.x + ca.y * r.y) / length2);
      const da = sub(d, a); add((da.x * r.x + da.y * r.y) / length2);
    }
  }
  cuts.sort((x, y) => x - y);
  const length = Math.sqrt(length2), normal = { x: -r.y / length * 1e-5, y: r.x / length * 1e-5 };
  for (let i = 1; i < cuts.length; i++) {
    if ((cuts[i] - cuts[i - 1]) * length <= EPS) continue;
    const t = (cuts[i] + cuts[i - 1]) / 2, p = { x: a.x + t * r.x, y: a.y + t * r.y };
    if (polygons.some(s => location(p, s) === 2)) return true;
    // Shared edges between sweep pieces are interior to their union, while
    // a wall merely touching the outside boundary is not an obstruction.
    if (polygons.some(s => location({ x: p.x + normal.x, y: p.y + normal.y }, s))
      && polygons.some(s => location({ x: p.x - normal.x, y: p.y - normal.y }, s))) return true;
  }
  return false;
}
