import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  BOTTOM_Y, LOOKS, buildBody, photoRadius, buildFace, chipGeo, crumbGeo, crumbTextures, doughTextures, insideXZ, rng, seam, seamMaterial, topAt,
  type ChipKind, type FlavourLook,
} from './proceduralCookie';

type Options = {
  flavour: string;
  modelUrl?: (flavour: string) => string;
  hasModel?: (flavour: string) => Promise<boolean>;
  /** Top-down photo unwrapped to a disk (see public/assets/products/{id}/tem_{id}_top.webp). */
  photoUrl?: (flavour: string) => string;
  preloadPhotos?: string[];
  onBreak?: (on: boolean) => void;
};

type PhotoLook = { map: THREE.Texture; rough: THREE.Texture; geo: THREE.BufferGeometry };

type CrumbDatum = { o: THREE.Vector3; v: THREE.Vector3; s: number; spin: THREE.Vector3; delay: number };

type ModelEntry = { root: THREE.Object3D; left: THREE.Object3D | null; right: THREE.Object3D | null };

const LEFT_RE = /(^|[_\-. ])(left|l|half_?a|half_?1|a)$/i;
const RIGHT_RE = /(^|[_\-. ])(right|r|half_?b|half_?2|b)$/i;

/**
 * Interactive turntable for the Flavour Room.
 * Shows /models/tem_{flavour}.glb when it exists, otherwise the procedural stand-in cookie.
 * A GLB that contains two top-level children named "..._left" and "..._right" (or half_a / half_b) breaks open along them.
 */
export class CookieScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private key: THREE.DirectionalLight;
  private cookie = new THREE.Group();
  private halves: THREE.Group[];
  private bodies: THREE.Mesh[] = [];
  private faces: THREE.Mesh[] = [];
  private chipGroups: THREE.Group[];
  private chipMat = new THREE.MeshPhysicalMaterial({ roughness: 0.38, clearcoat: 0.45, clearcoatRoughness: 0.3 });
  private chipGeos: Record<Exclude<ChipKind, 'none'>, THREE.BufferGeometry[]>;
  private crumbMat = new THREE.MeshPhysicalMaterial({ roughness: 0.92, bumpScale: 3 });
  private shardMat = new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.35 });
  private crumbs: THREE.InstancedMesh;
  private shards: THREE.InstancedMesh;
  private crumbData: CrumbDatum[];
  private NC: number;
  private NSH: number;
  private strands: THREE.Mesh[];
  private strandSeeds = Array.from({ length: 6 }, (_, i) => ({ z: -0.55 + i * 0.22 + (i % 2) * 0.05, y: 0.02 + (i % 3) * 0.05, r: 0.016 + (i % 3) * 0.008, snap: 0.42 + i * 0.045 }));
  private texCache: Record<string, { d: ReturnType<typeof doughTextures>; c: ReturnType<typeof crumbTextures> }> = {};
  private models: Record<string, Promise<ModelEntry | null>> = {};
  private photos: Record<string, Promise<PhotoLook | null>> = {};
  private photoReady: Record<string, PhotoLook | null> = {};
  private baseBodyGeo!: THREE.BufferGeometry;
  private NR = 150;
  private NS = 360;
  private activeModel: ModelEntry | null = null;
  private look: FlavourLook = LOOKS['choco-chips'];
  private flavourToken = 0;
  private dummy = new THREE.Object3D();
  private raf = 0;
  private last = performance.now();
  private resizeObs: ResizeObserver;
  private disposed = false;
  private low: boolean;
  private opts: Options;
  private st = { px: 0, py: 0, sx: 0, sy: 0, rotY: 0.4, rotX: 0, dragging: false, breakTarget: 0, b: 0, spin: 0, lx: 0, ly: 0, reduced: false };

  private container: HTMLElement;

  constructor(container: HTMLElement, opts: Options) {
    this.container = container;
    this.opts = opts;
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    this.low = Math.min(w, h) < 420 || (navigator.hardwareConcurrency ?? 8) <= 4;
    this.st.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.low ? 1.5 : 2));
    this.renderer.setSize(w, h);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const el = this.renderer.domElement;
    el.style.display = 'block';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.cursor = 'grab';
    el.style.touchAction = 'pan-y';
    container.appendChild(el);

    this.camera = new THREE.PerspectiveCamera(32, w / h, 0.01, 60);

    const env = new THREE.Scene();
    env.background = new THREE.Color('#2a0a10');
    const panel = (pw: number, ph: number, col: THREE.Color, p: [number, number, number]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }));
      m.position.set(...p);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel(6, 4, new THREE.Color(5, 4.2, 3.2), [-5, 6, 3]);
    panel(3, 8, new THREE.Color(1.8, 1.2, 1.0), [6, 2, -4]);
    panel(10, 3, new THREE.Color(0.55, 0.16, 0.2), [0, -4, 0]);
    panel(4, 2, new THREE.Color(1.4, 1.3, 1.2), [0, 3, 7]);
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pm.fromScene(env, 0.03).texture;
    this.scene.environmentIntensity = 0.55;
    pm.dispose();

    this.key = new THREE.DirectionalLight('#ffd7a6', 3.2);
    this.key.position.set(-3, 5, 2.5);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(this.low ? 1024 : 2048, this.low ? 1024 : 2048);
    Object.assign(this.key.shadow.camera, { left: -2.5, right: 2.5, top: 2.5, bottom: -2.5, near: 0.5, far: 14 });
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.02;
    this.key.shadow.radius = 4;
    this.scene.add(this.key);
    const rim = new THREE.SpotLight('#ffb98a', 28, 14, 0.6, 0.7);
    rim.position.set(2.5, 1.8, -3.2);
    this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight('#fbe7cf', '#4a1019', 0.55));
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.55;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.scene.add(this.cookie);
    this.halves = [-1, 1].map((side) => {
      const g = new THREE.Group();
      g.userData.side = side;
      this.cookie.add(g);
      return g;
    });
    this.chipGroups = this.halves.map((hv) => {
      const g = new THREE.Group();
      hv.add(g);
      return g;
    });

    const NR = this.low ? 90 : 150, NS = this.low ? 200 : 360;
    this.NR = NR;
    this.NS = NS;
    const bodyGeo = buildBody(NR, NS);
    this.baseBodyGeo = bodyGeo;
    const faceGeo = buildFace(this.low ? 140 : 220, this.low ? 26 : 44, 1.7);
    this.halves.forEach((hv, i) => {
      const side = hv.userData.side as number;
      const body = new THREE.Mesh(
        bodyGeo,
        seamMaterial(new THREE.MeshPhysicalMaterial({ roughness: 0.85, bumpScale: 2.2, sheen: 0.25, sheenRoughness: 0.8, sheenColor: new THREE.Color('#ffe2b8') }), side),
      );
      body.customDepthMaterial = seamMaterial(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), side);
      body.castShadow = body.receiveShadow = true;
      body.name = 'dough_' + i;
      const face = new THREE.Mesh(faceGeo, new THREE.MeshPhysicalMaterial({ roughness: 0.95, bumpScale: 5, side: THREE.DoubleSide }));
      face.castShadow = face.receiveShadow = true;
      hv.add(body, face);
      this.bodies.push(body);
      this.faces.push(face);
    });

    this.chipGeos = { chip: [], chunk: [], bits: [], nut: [] };
    (['chip', 'chunk', 'bits', 'nut'] as const).forEach((k) => (this.chipGeos[k] = [0, 1, 2, 3].map((s) => chipGeo(k, s * 7 + 1))));

    this.NC = this.low ? 140 : 320;
    this.NSH = this.low ? 24 : 60;
    this.crumbs = new THREE.InstancedMesh(crumbGeo(5), this.crumbMat, this.NC);
    this.shards = new THREE.InstancedMesh(crumbGeo(9), this.shardMat, this.NSH);
    this.crumbs.castShadow = this.shards.castShadow = true;
    this.scene.add(this.crumbs, this.shards);
    const cr = rng(31);
    this.crumbData = Array.from({ length: this.NC + this.NSH }, (_, i) => {
      const z = (cr() * 2 - 1) * 0.85, y = cr() * 0.18 - 0.02, side = cr() < 0.5 ? -1 : 1, big = cr() < 0.08;
      return {
        o: new THREE.Vector3(seam(z, y), y, z),
        v: new THREE.Vector3(side * (0.25 + cr() * 0.9), 0.25 + cr() * 1.1, (cr() * 2 - 1) * 0.6),
        s: (big ? 0.03 + cr() * 0.03 : 0.006 + Math.pow(cr(), 2) * 0.022) * (i >= this.NC ? 0.8 : 1),
        spin: new THREE.Vector3(cr() * 9, cr() * 9, cr() * 9),
        delay: cr() * 0.25,
      };
    });

    const strandMat = new THREE.MeshPhysicalMaterial({ color: '#3a1d0e', roughness: 0.22, clearcoat: 0.8, clearcoatRoughness: 0.15 });
    this.strands = this.strandSeeds.map(() => {
      const m = new THREE.Mesh(new THREE.BufferGeometry(), strandMat);
      m.castShadow = true;
      this.scene.add(m);
      return m;
    });

    el.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    el.addEventListener('dblclick', this.onDbl);
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(container);

    this.setFlavour(opts.flavour, false);
    if (opts.photoUrl) (opts.preloadPhotos ?? []).forEach((id) => this.loadPhoto(id));
    this.raf = requestAnimationFrame(this.frame);
  }

  setFlavour(id: string, spin = true) {
    const token = ++this.flavourToken;
    if (spin) this.st.spin += Math.PI * 1.2;
    this.st.breakTarget = 0;
    this.look = LOOKS[id] ?? LOOKS['choco-chips'];
    const ready = this.photoReady[id];
    if (ready) this.applyPhoto(id, ready);
    else this.applyProcedural(id);
    this.showModel(null);
    if (ready === undefined && this.opts.photoUrl) {
      this.loadPhoto(id).then((look) => {
        if (look && token === this.flavourToken && !this.disposed) this.applyPhoto(id, look);
      });
    }
    const { hasModel, modelUrl } = this.opts;
    if (!hasModel || !modelUrl) return;
    hasModel(id).then((ok) => {
      if (!ok || token !== this.flavourToken || this.disposed) return;
      this.loadModel(id, modelUrl(id)).then((entry) => {
        if (entry && token === this.flavourToken && !this.disposed) this.showModel(entry);
      });
    });
  }

  private loadPhoto(id: string) {
    if (!this.photos[id]) {
      const url = this.opts.photoUrl!(id);
      this.photos[id] = new Promise<PhotoLook | null>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (this.disposed) return resolve(null);
          const S = 512;
          const cv = document.createElement('canvas');
          cv.width = cv.height = S;
          const g = cv.getContext('2d', { willReadFrequently: true })!;
          g.drawImage(img, 0, 0, S, S);
          const data = g.getImageData(0, 0, S, S).data;
          const lumAt = (px: number, py: number) => {
            const x = Math.min(S - 1, Math.max(0, Math.round(px))), y = Math.min(S - 1, Math.max(0, Math.round(py)));
            const o = (y * S + x) * 4;
            return (data[o] * 0.299 + data[o + 1] * 0.587 + data[o + 2] * 0.114) / 255;
          };
          let sum = 0;
          for (let i = 0; i < data.length; i += 16) sum += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
          const mean = sum / (data.length / 16);
          const relief = (u: number, th: number) => {
            const ru = photoRadius(true, u);
            const px = (Math.cos(th) * ru * 0.45 + 0.5) * S, py = (1 - (Math.sin(th) * ru * 0.45 + 0.5)) * S;
            let l = 0;
            for (let k = 0; k < 5; k++) l += lumAt(px + [0, 2, -2, 0, 0][k], py + [0, 0, 0, 2, -2][k]);
            return (l / 5 - mean) * 0.06;
          };
          const geo = buildBody(this.NR, this.NS, relief);
          const rc = document.createElement('canvas');
          rc.width = rc.height = S;
          const rg = rc.getContext('2d')!;
          const ri = rg.createImageData(S, S);
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255, gg = data[i + 1] / 255, b = data[i + 2] / 255;
            const lum = r * 0.299 + gg * 0.587 + b * 0.114;
            const chocolate = Math.max(0, Math.min(1, (0.42 - lum) / 0.25)) * Math.max(0, Math.min(1, (r - b) * 4));
            const v = Math.round((0.86 - chocolate * 0.55) * 255);
            ri.data[i] = ri.data[i + 1] = ri.data[i + 2] = v;
            ri.data[i + 3] = 255;
          }
          rg.putImageData(ri, 0, 0);
          const map = new THREE.Texture(img);
          map.colorSpace = THREE.SRGBColorSpace;
          map.anisotropy = 8;
          map.needsUpdate = true;
          const rough = new THREE.CanvasTexture(rc);
          resolve({ map, rough, geo });
        };
        img.onerror = () => resolve(null);
        img.src = url;
      }).then((look) => {
        this.photoReady[id] = look;
        return look;
      });
    }
    return this.photos[id];
  }

  private applyPhoto(id: string, look: PhotoLook) {
    if (!this.texCache[id]) this.texCache[id] = { d: doughTextures(this.look, this.low ? 256 : 512), c: crumbTextures(this.look, 512) };
    const { c } = this.texCache[id];
    this.bodies.forEach((b) => {
      b.geometry = look.geo;
      const m = b.material as THREE.MeshPhysicalMaterial;
      m.map = look.map;
      m.bumpMap = look.map;
      m.bumpScale = 1.4;
      m.roughnessMap = look.rough;
      m.roughness = 1;
      m.needsUpdate = true;
    });
    this.faces.forEach((f) => {
      const m = f.material as THREE.MeshPhysicalMaterial;
      m.map = c.map;
      m.bumpMap = c.bump;
      m.needsUpdate = true;
    });
    this.crumbMat.map = c.map;
    this.crumbMat.bumpMap = c.bump;
    this.crumbMat.needsUpdate = true;
    this.shardMat.color.set(this.look.chip || '#2b170e');
    this.chipGroups.forEach((g) => g.clear());
  }

  setBroken(on: boolean) {
    this.st.breakTarget = on ? 1 : 0;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    const el = this.renderer.domElement;
    el.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    el.removeEventListener('dblclick', this.onDbl);
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    Object.values(this.photoReady).forEach((p) => p && [p.map, p.rough, p.geo].forEach((x) => x.dispose()));
    Object.values(this.texCache).forEach(({ d, c }) => [d.map, d.bump, d.rough, c.map, c.bump].forEach((t) => t.dispose()));
    this.renderer.dispose();
    el.remove();
  }

  private onDown = (e: PointerEvent) => {
    this.st.dragging = true;
    this.st.lx = e.clientX;
    this.st.ly = e.clientY;
    this.renderer.domElement.style.cursor = 'grabbing';
  };

  private onMove = (e: PointerEvent) => {
    const r = this.container.getBoundingClientRect();
    this.st.px = ((e.clientX - r.left) / r.width) * 2 - 1;
    this.st.py = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (!this.st.dragging) return;
    this.st.rotY += (e.clientX - this.st.lx) * 0.01;
    this.st.rotX = Math.min(0.7, Math.max(-0.5, this.st.rotX + (e.clientY - this.st.ly) * 0.006));
    this.st.lx = e.clientX;
    this.st.ly = e.clientY;
  };

  private onUp = () => {
    this.st.dragging = false;
    this.renderer.domElement.style.cursor = 'grab';
  };

  private onDbl = () => {
    this.st.breakTarget = this.st.breakTarget ? 0 : 1;
    this.opts.onBreak?.(!!this.st.breakTarget);
  };

  private resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private applyProcedural(id: string) {
    const F = this.look;
    const S = this.low ? 512 : 1024;
    if (!this.texCache[id]) this.texCache[id] = { d: doughTextures(F, S), c: crumbTextures(F, 512) };
    const { d, c } = this.texCache[id];
    this.bodies.forEach((b) => {
      b.geometry = this.baseBodyGeo;
      const m = b.material as THREE.MeshPhysicalMaterial;
      m.map = d.map;
      m.bumpMap = d.bump;
      m.bumpScale = 2.2;
      m.roughness = 0.85;
      m.roughnessMap = d.rough;
      m.needsUpdate = true;
    });
    this.faces.forEach((f) => {
      const m = f.material as THREE.MeshPhysicalMaterial;
      m.map = c.map;
      m.bumpMap = c.bump;
      m.needsUpdate = true;
    });
    this.crumbMat.map = c.map;
    this.crumbMat.bumpMap = c.bump;
    this.crumbMat.color.setRGB(0.92, 0.88, 0.85);
    this.crumbMat.needsUpdate = true;
    this.shardMat.color.set(F.chip || '#2b170e');
    this.buildChips(F);
  }

  private buildChips(F: FlavourLook) {
    this.chipGroups.forEach((g) => g.clear());
    if (!F.chip || F.kind === 'none') return;
    const kind = F.kind;
    this.chipMat.color.set(F.chip);
    this.chipMat.roughness = F.chipRough ?? 0.38;
    this.chipMat.clearcoat = F.chipRough && F.chipRough > 0.5 ? 0 : 0.45;
    const r = rng(17);
    const size = { chip: 0.052, chunk: 0.085, bits: 0.028, nut: 0.055 }[kind];
    const place = (x: number, y: number, z: number, s: number) => {
      const m = new THREE.Mesh(this.chipGeos[kind][Math.floor(r() * 4)], this.chipMat);
      m.castShadow = m.receiveShadow = true;
      m.position.set(x, y, z);
      m.rotation.set(r() * 0.6 - 0.3, r() * 6.3, r() * 0.6 - 0.3);
      m.scale.setScalar(s);
      (x < seam(z, y) ? this.chipGroups[0] : this.chipGroups[1]).add(m);
    };
    for (let i = 0; i < F.n; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.84, x = Math.cos(a) * d, z = Math.sin(a) * d;
      const s = size * (0.6 + r() * 0.8);
      place(x, topAt(x, z) - s * 0.42, z, s);
    }
    for (let i = 0; i < Math.round(F.n * 0.5); i++) {
      const z = (r() * 2 - 1) * 0.8, x = seam(z, 0) + (r() - 0.5) * 0.12;
      if (!insideXZ(x, z)) continue;
      place(x, -0.03 + r() * Math.max(0.02, topAt(x, z) - 0.06), z, size * (0.55 + r() * 0.6));
    }
  }

  private loadModel(id: string, url: string) {
    if (!this.models[id]) {
      this.models[id] = new GLTFLoader()
        .loadAsync(url)
        .then((gltf) => {
          const root = gltf.scene;
          const box = new THREE.Box3().setFromObject(root);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const k = 2 / Math.max(size.x, size.z, 1e-6);
          const wrap = new THREE.Group();
          root.position.set(-center.x, -box.min.y, -center.z);
          wrap.add(root);
          wrap.scale.setScalar(k);
          wrap.position.y = BOTTOM_Y;
          root.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.isMesh) m.castShadow = m.receiveShadow = true;
          });
          let left: THREE.Object3D | null = null, right: THREE.Object3D | null = null;
          root.traverse((o) => {
            if (!left && LEFT_RE.test(o.name)) left = o;
            else if (!right && RIGHT_RE.test(o.name)) right = o;
          });
          [left, right].forEach((o) => {
            const n = o as THREE.Object3D | null;
            if (n) n.userData.home = { p: n.position.clone(), r: n.rotation.clone() };
          });
          return { root: wrap, left, right } as ModelEntry;
        })
        .catch(() => null);
    }
    return this.models[id];
  }

  private showModel(entry: ModelEntry | null) {
    if (this.activeModel) this.cookie.remove(this.activeModel.root);
    this.activeModel = entry;
    this.halves.forEach((h) => (h.visible = !entry));
    if (entry) this.cookie.add(entry.root);
  }

  private updateCrumbs(t: number) {
    for (let i = 0; i < this.crumbData.length; i++) {
      const c = this.crumbData[i], tt = Math.max(0, t - c.delay);
      const p = c.o.clone().addScaledVector(c.v, tt);
      p.y -= 0.9 * tt * tt;
      p.applyMatrix4(this.cookie.matrixWorld);
      this.dummy.position.copy(p);
      this.dummy.rotation.set(c.spin.x * tt, c.spin.y * tt, c.spin.z * tt);
      this.dummy.scale.setScalar(tt > 0 ? c.s : 0);
      this.dummy.updateMatrix();
      if (i < this.NC) this.crumbs.setMatrixAt(i, this.dummy.matrix);
      else this.shards.setMatrixAt(i - this.NC, this.dummy.matrix);
    }
    this.crumbs.instanceMatrix.needsUpdate = true;
    this.shards.instanceMatrix.needsUpdate = true;
  }

  private updateStrands(b: number) {
    const molten = !!this.look.molten && !this.activeModel;
    this.strands.forEach((m, i) => {
      const s = this.strandSeeds[i];
      if (!molten || b <= 0.02 || b > s.snap) {
        m.visible = false;
        return;
      }
      const a = new THREE.Vector3(seam(s.z, s.y) - 0.005, s.y, s.z).applyMatrix4(this.halves[0].matrixWorld);
      const c = new THREE.Vector3(seam(s.z, s.y) + 0.005, s.y, s.z).applyMatrix4(this.halves[1].matrixWorld);
      const mid = a.clone().lerp(c, 0.5);
      mid.y -= a.distanceTo(c) * 0.35;
      m.geometry.dispose();
      m.geometry = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, c), 20, s.r * Math.max(0.15, 1 - b / s.snap), 8, false);
      m.visible = true;
    });
  }

  private frame = (now: number) => {
    if (this.disposed) return;
    const st = this.st;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    st.sx += (st.px - st.sx) * 0.06;
    st.sy += (st.py - st.sy) * 0.06;
    if (!st.dragging && !st.reduced) st.rotY += dt * 0.18;
    st.spin *= 0.92;
    const k = st.breakTarget > st.b ? 0.9 : 1.6;
    st.b = Math.min(1, Math.max(0, st.b + Math.sign(st.breakTarget - st.b) * dt * k));
    if (Math.abs(st.breakTarget - st.b) < 0.01) st.b = st.breakTarget;
    const b = st.reduced ? st.breakTarget : st.b;
    const portrait = this.container.clientHeight > this.container.clientWidth;
    const dist = portrait ? 1.55 : 1.28;
    this.camera.position.set(0, 2.0 * dist, 3.3 * dist);
    this.camera.lookAt(0, -0.05, 0);
    this.cookie.rotation.y = st.rotY + st.spin;
    this.cookie.rotation.x = st.rotX * 0.6 + st.sy * 0.04;
    this.key.position.set(-3 + st.sx * 1.5, 5, 2.5);

    const be = 1 - Math.pow(1 - b, 3);
    this.faces.forEach((f) => (f.visible = b > 0.002));
    this.halves.forEach((h) => {
      const s = h.userData.side as number;
      h.position.set(s * be * 0.42, be * 0.06, 0);
      h.rotation.set(0, -s * be * 0.22, -s * be * 0.32);
    });
    const m = this.activeModel;
    if (m) {
      const parts: [THREE.Object3D | null, number][] = [[m.left, -1], [m.right, 1]];
      const inv = 1 / m.root.scale.x;
      parts.forEach(([o, s]) => {
        if (!o) return;
        const home = o.userData.home as { p: THREE.Vector3; r: THREE.Euler };
        o.position.set(home.p.x + s * be * 0.42 * inv, home.p.y + be * 0.06 * inv, home.p.z);
        o.rotation.set(home.r.x, home.r.y - s * be * 0.22, home.r.z - s * be * 0.32);
      });
      if (!m.left || !m.right) m.root.rotation.z = Math.sin(be * Math.PI) * 0.08;
    }
    this.cookie.updateMatrixWorld(true);
    this.updateCrumbs(b * 1.15);
    this.updateStrands(b);
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.frame);
  };
}
