import * as THREE from "https://cdn.skypack.dev/three@0.134.0";
import OrbitControls from "https://cdn.skypack.dev/orbit-controls-es6@2.0.1";

const globe_map_url =
    "https://github.githubassets.com/images/modules/site/home/globe/map.png",
  image = new Image(),
  globe_el = document.getElementById("globe"),
  GLOBE_RADIUS = 25,
  DEG2RAD = Math.PI / 180,
  worldDotRows = 200,
  worldDotSize = 0.105,
  worldDotColor = 0x6272f0;

let W = Math.min(window.innerWidth, window.innerHeight);
let H = W;

image.src = globe_map_url;
image.crossOrigin = "Anonymous";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(20, W / H, 170, 260);
camera.position.set(0, 80, 200);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(W, H);
globe_el.appendChild(renderer.domElement);

const parentContainer = new THREE.Group();
const euler = new THREE.Euler(0.3, 4.6, 0.05);
let rot = euler;
const offset = new Date().getTimezoneOffset() || 0;
rot.y = euler.y + Math.PI * (offset / 720);
// parentContainer.rotation.copy(rot);
scene.add(parentContainer);
const haloContainer = new THREE.Group();
scene.add(haloContainer);

// Special Globe object
class GLOBE {
  constructor(t) {
    (this.props = t), this.init();
  }
  init() {
    const {
        radius: t,
        detail: e = 50,
        renderer: n,
        shadowPoint: i,
        highlightPoint: r,
        highlightColor: a,
        frontHighlightColor: s = 3555965,
        waterColor: o = 857395,
        landColorFront: l = 16777215,
        shadowDist: c,
        highlightDist: h,
        frontPoint: d,
      } = this.props,
      u = new THREE.SphereGeometry(t, e, e),
      p = new THREE.MeshStandardMaterial({
        color: o,
        metalness: 0,
        roughness: 0.9,
      });
    (this.uniforms = []),
      (p.onBeforeCompile = (t) => {
        (t.uniforms.shadowDist = {
          value: c,
        }),
          (t.uniforms.highlightDist = {
            value: h,
          }),
          (t.uniforms.shadowPoint = {
            value: new THREE.Vector3().copy(i),
          }),
          (t.uniforms.highlightPoint = {
            value: new THREE.Vector3().copy(r),
          }),
          (t.uniforms.frontPoint = {
            value: new THREE.Vector3().copy(d),
          }),
          (t.uniforms.highlightColor = {
            value: new THREE.Color(a),
          }),
          (t.uniforms.frontHighlightColor = {
            value: new THREE.Color(s),
          }),
          (t.vertexShader =
            "#define GLSLIFY 1\n#define STANDARD\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n\t#ifdef USE_TANGENT\n\t\tvarying vec3 vTangent;\n\t\tvarying vec3 vBitangent;\n\t#endif\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\nvarying vec3 vWorldPosition;\n\nvoid main() {\n\t#include <uv_vertex>\n\t#include <uv2_vertex>\n\t#include <color_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n\t#ifdef USE_TANGENT\n\t\tvTangent = normalize( transformedTangent );\n\t\tvBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );\n\t#endif\n#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t// # include <worldpos_vertex>\n    vec4 worldPosition = vec4( transformed, 1.0 );\n\n\t#ifdef USE_INSTANCING\n\n\t\tworldPosition = instanceMatrix * worldPosition;\n\n\t#endif\n\n\tworldPosition = modelMatrix * worldPosition;\n\tvWorldPosition = worldPosition.xyz;\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}"),
          this.uniforms.push(t.uniforms);
      }),
      (p.defines = {
        USE_HIGHLIGHT: 1,
        USE_HIGHLIGHT_ALT: 1,
        USE_FRONT_HIGHLIGHT: 1,
        DITHERING: 1,
      }),
      (this.mesh = new THREE.Group());
    const m = new THREE.Mesh(u, p);
    (m.renderOrder = 1),
      this.mesh.add(m),
      (this.meshFill = m),
      (this.materials = [p]);
  }
  setShadowPoint(t) {
    this.uniforms &&
      this.uniforms.forEach((e) => {
        e.shadowPoint.value.copy(t);
      });
  }
  setHighlightPoint(t) {
    this.uniforms &&
      this.uniforms.forEach((e) => {
        e.highlightPoint.value.copy(t);
      });
  }
  setFrontPoint(t) {
    this.uniforms &&
      this.uniforms.forEach((e) => {
        e.frontPoint.value.copy(t);
      });
  }
  setShadowDist(t) {
    this.uniforms &&
      this.uniforms.forEach((e) => {
        e.shadowDist.value = t;
      });
  }
  setHighlightDist(t) {
    this.uniforms &&
      this.uniforms.forEach((e) => {
        e.highlightDist.value = t;
      });
  }
  dispose() {
    (this.mesh = null),
      (this.materials = null),
      (this.uniforms = null),
      (this.meshFill = null);
  }
}

image.onload = () => {
  // init scene
  // draw globe
  // draw halo
  draw_world_dots();
  // draw arcs
};

// GLOBE WATER
const shadowPoint = new THREE.Vector3()
    .copy(parentContainer.position)
    .add(
      new THREE.Vector3(0.7 * GLOBE_RADIUS, 0.3 * -GLOBE_RADIUS, GLOBE_RADIUS)
    ),
  highlightPoint = new THREE.Vector3()
    .copy(parentContainer.position)
    .add(new THREE.Vector3(1.5 * -GLOBE_RADIUS, 1.5 * -GLOBE_RADIUS, 0)),
  frontPoint = new THREE.Vector3()
    .copy(parentContainer.position)
    .add(new THREE.Vector3(0, 0, GLOBE_RADIUS)),
  globe = new GLOBE({
    radius: GLOBE_RADIUS,
    detail: 55,
    renderer: renderer,
    shadowPoint: shadowPoint,
    shadowDist: 1.5 * GLOBE_RADIUS,
    highlightPoint: highlightPoint,
    highlightColor: 5339494,
    highlightDist: 5,
    frontPoint: frontPoint,
    frontHighlightColor: 2569853,
    waterColor: 1513012,
    landColorFront: 16777215,
    landColorBack: 16777215,
  });
scene.add(globe.mesh);
//

// HALO
const a = new THREE.SphereGeometry(GLOBE_RADIUS, 45, 45),
  s = new THREE.ShaderMaterial({
    uniforms: {
      c: {
        type: "f",
        value: 0.7,
      },
      p: {
        type: "f",
        value: 15,
      },
      glowColor: {
        type: "c",
        value: new THREE.Color(1844322),
      },
      viewVector: {
        type: "v3",
        value: new THREE.Vector3(0, 0, 220),
      },
    },
    vertexShader:
      "#define GLSLIFY 1\nuniform vec3 viewVector;\nuniform float c;\nuniform float p;\nvarying float intensity;\nvarying float intensityA;\nvoid main() \n{\n  vec3 vNormal = normalize( normalMatrix * normal );\n  vec3 vNormel = normalize( normalMatrix * viewVector );\n  intensity = pow( c - dot(vNormal, vNormel), p );\n  intensityA = pow( 0.63 - dot(vNormal, vNormel), p );\n  \n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}",
    fragmentShader:
      "#define GLSLIFY 1\nuniform vec3 glowColor;\nvarying float intensity;\nvarying float intensityA;\nvoid main()\n{\n  gl_FragColor = vec4( glowColor * intensity, 1.0 * intensityA );\n}",
    side: 1,
    blending: 2,
    transparent: !0,
    dithering: !0,
  }),
  halo = new THREE.Mesh(a, s);
halo.scale.multiplyScalar(1.15);
halo.rotateX(0.03 * Math.PI);
halo.rotateY(0.03 * Math.PI);
halo.renderOrder = 3;
haloContainer.add(halo);
haloContainer.position.set(0, 0, -10);

// LIGHTS
const light_amb = new THREE.AmbientLight(16777215, 0.7),
  light_spot_1 = new THREE.SpotLight(2197759, 40, 15, 0.2, 0, 0.9),
  light_spot_2 = new THREE.SpotLight(16018366, 2, 75, 0.5, 0, 1.25),
  light_dir = new THREE.DirectionalLight(11124735, 5);

light_spot_1.position.set(
  parentContainer.position.x - 2.5 * GLOBE_RADIUS,
  70,
  20
); //.multiplyScalar(t);
light_spot_2.position.set(
  parentContainer.position.x + GLOBE_RADIUS,
  GLOBE_RADIUS,
  2 * GLOBE_RADIUS
); //.multiplyScalar(t)
light_spot_2.distance = 75; // * t
// light_dir.position.set(parentContainer.position.x - 50, parentContainer.position.y + 30, 10); //.multiplyScalar(t)
light_dir.position.set(parentContainer.position.x - 3.8 * GLOBE_RADIUS, 50, 30); //.multiplyScalar(t)

light_spot_1.target = parentContainer;
light_spot_2.target = parentContainer;
light_dir.target = parentContainer;

const group = new THREE.Group();
group.add(light_amb, light_spot_1, light_dir, haloContainer);

const groupCameraPosD = new THREE.Vector3(
  group.position.x - camera.position.x,
  group.position.y - camera.position.y,
  group.position.z - camera.position.z
);
const groupCameraRotD = new THREE.Quaternion(
  group.quaternion.x - camera.quaternion.x,
  group.quaternion.y - camera.quaternion.y,
  group.quaternion.z - camera.quaternion.z,
  group.quaternion.w - camera.quaternion.w
);
console.log(groupCameraRotD);
camera.lookAt(0, 0, 0);

scene.add(group);

window.addEventListener("keypress", (e) => {
  if (e.key === " ") {
    document.querySelector("#globe canvas").toBlob(function (blob) {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
    });
  }
});

const enableControls = true;
let controls;

if (enableControls) {
  controls = new OrbitControls(camera, globe_el);
  controls.rotateSpeed = 0.07;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minPolarAngle = Math.PI * 0.25;
  controls.maxPolarAngle = Math.PI * 0.75;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.05;
}

const animate = () => {
  requestAnimationFrame(animate);
  // parentContainer.rotation.y += 0.002;
  if (enableControls) {
    controls.update();
  }
  const newPos = camera.position.clone().add(groupCameraPosD);
  // group.position.set(newPos.x, newPos.y, newPos.z)
  const newRot = camera.quaternion.clone();
  group.quaternion.set(
    newRot.x + groupCameraRotD.x,
    newRot.y + groupCameraRotD.y,
    newRot.z + groupCameraRotD.z,
    newRot.w + groupCameraRotD.w
  );

  renderer.render(scene, camera);
};

animate();

function draw_world_dots() {
  const e = new THREE.Object3D(),
    d = getImageData(image),
    i = [],
    r = worldDotRows;
  for (let lat = -90; lat <= 90; lat += 180 / r) {
    const radius = Math.cos(Math.abs(lat) * DEG2RAD) * GLOBE_RADIUS;
    const circum = radius * Math.PI * 2 * 2;
    for (let r = 0; r < circum; r++) {
      const lng = (360 * r) / circum - 180;
      if (!visibilityForCoordinate(lng, lat, d)) continue;
      const s = calc_pos(lat, lng, GLOBE_RADIUS);
      e.position.set(s.x, s.y, s.z);
      const o = calc_pos(lat, lng, GLOBE_RADIUS + 5);
      e.lookAt(o.x, o.y, o.z);
      e.updateMatrix();
      i.push(e.matrix.clone());
    }
  }
  const dot = new THREE.CircleGeometry(worldDotSize, 5),
    dot_mat = new THREE.MeshStandardMaterial({
      color: worldDotColor,
      metalness: 0,
      roughness: 0.9,
      transparent: !0,
      alphaTest: 0.02,
    });
  dot_mat.onBeforeCompile = (t) => {
    t.fragmentShader = t.fragmentShader.replace(
      "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
      "\n        gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n        if (gl_FragCoord.z > 0.51) {\n          gl_FragColor.a = 1.0 + ( 0.51 - gl_FragCoord.z ) * 17.0;\n        }\n      "
    );
  };

  const o = new THREE.InstancedMesh(dot, dot_mat, i.length);
  for (let l = 0; l < i.length; l++) o.setMatrixAt(l, i[l]);
  o.renderOrder = 3;
  //worldMesh = o;
  parentContainer.add(o);
}

function visibilityForCoordinate(lng, lat, data) {
  const i = 4 * data.width,
    r = parseInt(((lng + 180) / 360) * data.width + 0.5),
    a = data.height - parseInt(((lat + 90) / 180) * data.height - 0.5),
    s = parseInt(i * (a - 1) + 4 * r) + 3;
  return data.data[s] > 90;
}

function getImageData(img) {
  const el = document.createElement("canvas").getContext("2d");
  return (
    (el.canvas.width = img.width),
    (el.canvas.height = img.height),
    el.drawImage(img, 0, 0, img.width, img.height),
    el.getImageData(0, 0, img.width, img.height)
  );
}

function calc_pos(lat, lng, R, vec) {
  vec = vec || new THREE.Vector3();
  const V = (90 - lat) * DEG2RAD,
    H = (lng + 180) * DEG2RAD;
  return (
    vec.set(
      -R * Math.sin(V) * Math.cos(H),
      R * Math.cos(V),
      R * Math.sin(V) * Math.sin(H)
    ),
    vec
  );
}
