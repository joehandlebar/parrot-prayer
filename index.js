import THREE from 'three';
import parrotData from './parrot';
import OrbitControls from './controls/OrbitControls.js';
import I from 'immutable';

const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;

// this one doesn't support import/export yet
const glslify = require('glslify');

const raf = window.requestAnimationFrame;

let TIME = 0;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

const container = document.getElementById('container');
container.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 40);
camera.position.z = 20;

const controls = new OrbitControls(camera, renderer.domElement);

//load up a test image
const textureLoader = new THREE.TextureLoader();

const P = [].concat(parrotData.p0).concat(parrotData.p1).concat(parrotData.p2);
const pts = new THREE.Geometry();
pts.vertices = P;

const ptsMat =  new THREE.PointsMaterial({
  color: 0xffff00,
  size: 0.15
});
const ctrlPts = new THREE.Points(pts, ptsMat);
//scene.add(ctrlPts);

const material = I.fromJS({
  vertexShader: glslify('./shaders/sway.vert.glsl'),
  fragmentShader: glslify('./shaders/pink.frag.glsl'),
  shading: THREE.SmoothShading,
  uniforms: {
    iTime: { type: 'f', value: 0 },
    iModelToWorldMatrix: {
        type: 'mat4', 
        value: []
    },
    iCol0: { type: 'v3v', value: parrotData.col0 },
    iCol1: { type: 'v3v', value: parrotData.col1 },
    iCol2: { type: 'v3v', value: parrotData.col2 },
    iCol3: { type: 'v3v', value: parrotData.col3 },
    iCol4: { type: 'v3v', value: parrotData.col4 },
    iCol5: { type: 'v3v', value: parrotData.col5 },
    iTex: { type: 't', value: textureLoader.load('textures/parrot.gif') }
  },
  vertexColors: THREE.VertexColors,
  //wireframe: true,
  defines: {
    USE_MAP: ''
  }
});

const mTw = new THREE.Matrix4();
mTw.set(
    1.0, 0, 0, .0,
    0, 1.0, 0, -5.0,
    0, 0, 1.0, -5.0,
    0, 0, 0, 1.0
);

const parrotMats = [];

// note USE_MAP is needed to get a 'uv' attribute
parrotMats.push(new THREE.ShaderMaterial(material.updateIn(
  ['uniforms', 'iModelToWorldMatrix', 'value'],
  (val) => {
    const m = new THREE.Matrix4();
    m.set(
        1.0, 0, 0, .0,
        0, 1.0, 0, 0,
        0, 0, 1.0, 1.0,
        0, 0, 0, 1.0
    );
    return m.elements;
  }
).toJS()));

parrotMats.push(new THREE.ShaderMaterial(material.updateIn(
  ['uniforms', 'iModelToWorldMatrix', 'value'],
  (val) => {
    const m = new THREE.Matrix4();
    m.set(
        1.0, 0, 0, 10.0,
        0, 1.0, 0, .0,
        0, 0, 1.0, -5.0,
        0, 0, 0, 1.0
    );
    return m.elements;
  }
).toJS()));

parrotMats.push(new THREE.ShaderMaterial(material.updateIn(
  ['uniforms', 'iModelToWorldMatrix', 'value'],
  (val) => {
    const m = new THREE.Matrix4();
    m.set(
        1.0, 0, 0, -10.0,
        0, 1.0, 0, .0,
        0, 0, 1.0, -5.0,
        0, 0, 0, 1.0
    );
    return m.elements;
  }
).toJS()));

parrotMats.push(new THREE.ShaderMaterial(material.updateIn(
  ['uniforms', 'iModelToWorldMatrix', 'value'],
  (val) => {
    const m = new THREE.Matrix4();
    m.set(
        1.0, 0, 0, 10.0,
        0, 1.0, 0, .0,
        0, 0, 1.0, 5.0,
        0, 0, 0, 1.0
    );
    return m.elements;
  }
).toJS()));

parrotMats.push(new THREE.ShaderMaterial(material.updateIn(
  ['uniforms', 'iModelToWorldMatrix', 'value'],
  (val) => {
    const m = new THREE.Matrix4();
    m.set(
        1.0, 0, 0, -10.0,
        0, 1.0, 0, .0,
        0, 0, 1.0, 5.0,
        0, 0, 0, 1.0
    );
    return m.elements;
  }
).toJS()));

const parrotGeom = new THREE.BufferGeometry();

parrotGeom.addAttribute(
  'position', 
  new THREE.BufferAttribute(parrotData.vertices, 3)
);

parrotGeom.setIndex(new THREE.BufferAttribute(parrotData.indices, 1));

parrotGeom.addAttribute(
  'uv', 
  new THREE.BufferAttribute(parrotData.uv, 2)
);

//parrotGeom.addAttribute(
  //'color', 
  //new THREE.BufferAttribute(
    //parrotData.vertices.map(i => 0.2 + 0.8*Math.random()), 
    //3
  //)
//);

const parrots = parrotMats.map(mat => new THREE.Mesh(parrotGeom, mat));
parrots.forEach(p => scene.add(p));

animate();

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    raf(animate);
    TIME += PI/90;
    const newRow0 = parrotData.row0.map(rotateCtrlPt(TIME % PI*2));
    const newRow1 = parrotData.row1.map(rotateCtrlPt((TIME + PI/2) % PI*2, TIME % PI*2));

    pts.vertices = [].concat(newRow0).concat(newRow1).concat(parrotData.row2);
    pts.verticesNeedUpdate = true;

    const colj = parrotData.initColj(newRow0, newRow1, parrotData.row2); 

    parrotMats.forEach((mat) => {
      mat.uniforms.iTime.value = TIME;
      mat.uniforms.iCol0.value = colj(0);
      mat.uniforms.iCol1.value = colj(1);
      mat.uniforms.iCol2.value = colj(2);
      mat.uniforms.iCol3.value = colj(3);
      mat.uniforms.iCol4.value = colj(4);
      mat.uniforms.iCol5.value = colj(5);
    });

    render();
}

function render() {
    renderer.render(scene, camera);
}

function rotateCtrlPt(t, s) {
  const h = s ? sin(s) : 0; 
  return (p, i) =>
    new THREE.Vector3(
      p.x + cos(t), 
      p.y + h, 
      p.z + sin(t)
    ); 
}
