import THREE from 'three';
import I from 'immutable';
import bezierPatch from './bezierPatch';

const h = 4; const r1 = 4; const r2 = 5; const r3 = 7;
const slices = 15; const m = 3; const n = 6;

// rows of control points
const p0 = I.fromJS([
  [0, h, -r1],
  [-r1, h, -r1 - 0.5],
  [-r1, h, r1],
  [r1, h, r1],
  [r1, h, -r1 - 0.5],
  [0, h, -r1]
]);

const p1 = I.fromJS([
  [0, h/2, -r2],
  [-r2, h/2, -r2 - 0.5],
  [-r2, h/2, r2],
  [r2, h/2, r2],
  [r2, h/2, -r2 - 0.5],
  [0, h/2, -r2]
]);

const p2 = I.fromJS([
  [0, 0, -r3],
  [-r3, 0, -r3 - 0.5],
  [-r3, 0, r3],
  [r3, 0, r3],
  [r3, 0, -r3 - 0.5],
  [0, 0, -r3]
]);

const P = I.List().concat(p0, p1, p2);

// coordinates on the patch   
const uv = I.Range(0, slices).map(u => 
  I.Range(0, slices).map(v => 
    I.List([u * 1/slices, v * 1/slices])
  )
).flatten();

const colj = initColj(
  p0.toJS().map(v3), 
  p1.toJS().map(v3), 
  p2.toJS().map(v3)
);

const data = {
  row0: p0.toJS().map(v3), 
  row1: p1.toJS().map(v3), 
  row2: p2.toJS().map(v3),

  col0: colj(0),
  col1: colj(1),
  col2: colj(2),
  col3: colj(3),
  col4: colj(4),
  col5: colj(5),

  initColj,

  vertices: new Float32Array( 
    bezierPatch.calcVertices(P, 0, I.List(), slices, m, n).flatten().toJS() 
  ),

  indices: new Uint16Array(
    bezierPatch.calcFaces(slices).flatten().toJS()
  ),

  uv: new Float32Array(uv.toJS())
};

export default data;

function initColj(p0, p1, p2) {
  return (j) => [p0[j], p1[j], p2[j]];
}
function v2(v) { return new THREE.Vector2(v[0], v[1]); }
function v3(v) { return new THREE.Vector3(v[0], v[1], v[2]); }
function v4(v) { return new THREE.Vector3(v[0], v[1], v[2], 1); }
function f3(v) { return new THREE.Face3(v[0], v[1], v[2]); }
