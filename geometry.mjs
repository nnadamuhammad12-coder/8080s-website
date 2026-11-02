export const SIDES = 8;
export function prism(radius = 1, depth = .7) {
  return [-depth, depth].flatMap(y => Array.from({length: SIDES}, (_, i) => {
    const angle = i * Math.PI / 4 + Math.PI / 8;
    return [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  }));
}
export function rotate([x,y,z], yaw, pitch, roll = 0) {
  const a=x*Math.cos(yaw)+z*Math.sin(yaw), b=-x*Math.sin(yaw)+z*Math.cos(yaw);
  const c=y*Math.cos(pitch)-b*Math.sin(pitch),d=y*Math.sin(pitch)+b*Math.cos(pitch);
  return [a*Math.cos(roll)-c*Math.sin(roll),a*Math.sin(roll)+c*Math.cos(roll),d];
}
export function project([x,y,z], width, height, scale) {
  const p=4.8/(4.8+z);
  return [width/2+x*scale*p,height*.45+y*scale*p,z];
}
export const faces = [Array.from({length:8},(_,i)=>7-i),Array.from({length:8},(_,i)=>8+i),...Array.from({length:8},(_,i)=>[i,(i+1)%8,(i+1)%8+8,i+8])];

// The outer octagon split into eight wedges, one per side, wrapped around the inner octagon.
// Each wedge: vertices 0-3 on the top cap (inner a, outer a, outer b, inner b), 4-7 on the bottom.
export const segmentFaces = [[0,1,2,3],[7,6,5,4],[1,5,6,2],[0,3,7,4],[0,4,5,1],[3,2,6,7]];
export const OUTER_FACE = 2;
export function segment(i, {inner = .62, outer = 1, depth = .7, gap = .035} = {}) {
  const a = i * Math.PI / 4 + Math.PI / 8, b = a + Math.PI / 4, mid = (a + b) / 2;
  const dir = [Math.cos(mid), 0, Math.sin(mid)];
  const pt = (r, ang, y) => [Math.cos(ang) * r, y, Math.sin(ang) * r];
  const raw = [-depth, depth].flatMap(y => [pt(inner, a, y), pt(outer, a, y), pt(outer, b, y), pt(inner, b, y)]);
  const centre = raw.reduce((s, p) => s.map((v, k) => v + p[k] / raw.length), [0, 0, 0]);
  // Shrink each wedge slightly so the seams between the eight pieces stay legible when assembled.
  const vertices = raw.map(p => p.map((v, k) => centre[k] + (v - centre[k]) * (1 - gap)));
  return {index: i, vertices, centre, dir};
}
export function segments(options) { return Array.from({length: SIDES}, (_, i) => segment(i, options)); }
// Where a wedge sits once the form opens: pushed out along its own side, alternating slightly up and down.
export function explodeOffset(seg, amount, focus = 0) {
  const d = amount * .34 + focus * .16;
  return [seg.dir[0] * d, (seg.index % 2 ? 1 : -1) * amount * .14 - focus * .08, seg.dir[2] * d];
}
export function convexHull(points) {
  const sorted = points.toSorted((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0]-o[0]) * (b[1]-o[1]) - (a[1]-o[1]) * (b[0]-o[0]);
  const lo = [], hi = [];
  for (const p of sorted) { while (lo.length > 1 && cross(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); }
  for (const p of sorted.toReversed()) { while (hi.length > 1 && cross(hi.at(-2), hi.at(-1), p) <= 0) hi.pop(); hi.push(p); }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
}
export function insidePolygon([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
