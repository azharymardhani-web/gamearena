import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  InformaticsMaterial,
  InformaticsQuestion,
  OptionKey,
} from '../data/informaticsData';
import { soundEngine } from '../utils/soundEngine';

export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 1500;

const SCALE_3D = 0.1;
const to3DX = (mapX: number) => (mapX - WORLD_WIDTH / 2) * SCALE_3D;
const to3DZ = (mapY: number) => (mapY - WORLD_HEIGHT / 2) * SCALE_3D;

// Pre-allocated math helpers at module scope (Zero GC in render loop)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();

export interface CharacterPresetConfig {
  id: string;
  name: string;
  tagline: string;
  jacketColor: string;
  shirtColor: string;
  pantsColor: string;
  skinColor: string;
  hairColor: string;
  hatStyle: 'CAP' | 'HIJAB' | 'HEADPHONES' | 'NONE';
}

export const CHARACTER_PRESETS: CharacterPresetConfig[] = [
  {
    id: 'cj_rizky',
    name: 'Rizky "CJ" Siber',
    tagline: 'Hoodie Hijau Grove · Spesialis Jaringan',
    jacketColor: '#16a34a',
    shirtColor: '#f8fafc',
    pantsColor: '#1e3a8a',
    skinColor: '#c68642',
    hairColor: '#0f172a',
    hatStyle: 'CAP',
  },
  {
    id: 'nadia_tech',
    name: 'Nadia "Tech" Putri',
    tagline: 'Rompi Biru MTsN 14 · Ahli Algoritma',
    jacketColor: '#0284c7',
    shirtColor: '#ffffff',
    pantsColor: '#0f172a',
    skinColor: '#f1c27d',
    hairColor: '#1e293b',
    hatStyle: 'HIJAB',
  },
  {
    id: 'bima_rider',
    name: 'Bima "Rider" Pratama',
    tagline: 'Jaket Biker Hitam-Emas · Penjaga Server',
    jacketColor: '#18181b',
    shirtColor: '#f59e0b',
    pantsColor: '#27272a',
    skinColor: '#d99b66',
    hairColor: '#09090b',
    hatStyle: 'NONE',
  },
  {
    id: 'siti_crypto',
    name: 'Siti "Crypto" Aulia',
    tagline: 'Tracksuit Merah Siber · Kriptografer',
    jacketColor: '#e11d48',
    shirtColor: '#f8fafc',
    pantsColor: '#1e293b',
    skinColor: '#f1c27d',
    hairColor: '#0f172a',
    hatStyle: 'HEADPHONES',
  },
  {
    id: 'dimas_hacker',
    name: 'Dimas "Hacker" Wijaya',
    tagline: 'Flanel Sian Elektrik · Debugger Cepat',
    jacketColor: '#0891b2',
    shirtColor: '#0f172a',
    pantsColor: '#334155',
    skinColor: '#e0ac69',
    hairColor: '#1e1b4b',
    hatStyle: 'CAP',
  },
  {
    id: 'zahra_analis',
    name: 'Zahra "Analis" Nabila',
    tagline: 'Blazer Ungu Akademik · Analis Data',
    jacketColor: '#7c3aed',
    shirtColor: '#fde68a',
    pantsColor: '#1e1b4b',
    skinColor: '#f1c27d',
    hairColor: '#0f172a',
    hatStyle: 'HIJAB',
  },
];

export interface MapPlayerEntity {
  id: string;
  name: string;
  studentClass: string;
  role: 'TEACHER' | 'STUDENT';
  characterPreset?: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  score: number;
  missionPoints?: number;
  collectedItemsCount?: number;
  answeredCount?: number;
  streak: number;
  hp: number;
  currentSector: OptionKey | null;
  lockedOption: OptionKey | null;
  isRoamingPeer?: boolean;
}

export interface TeacherPostLocation {
  index: number;
  title: string;
  buildingName: string;
  mapX: number;
  mapY: number;
  colorHex: number;
}

export const TEACHER_POSTS: TeacherPostLocation[] = [
  {
    index: 0,
    title: 'Pak Azhary Mardhani · Gedung Utama MTsN 14',
    buildingName: 'GEDUNG UTAMA MTsN 14 JAKARTA',
    mapX: 1200,
    mapY: 360,
    colorHex: 0xf59e0b,
  },
  {
    index: 1,
    title: 'Pos Guru 2 · Lab Sistem Komputer',
    buildingName: 'LAB SISTEM KOMPUTER & HARDWARE',
    mapX: 460,
    mapY: 380,
    colorHex: 0x0ea5e9,
  },
  {
    index: 2,
    title: 'Pos Guru 3 · Menara Jaringan & Internet',
    buildingName: 'MENARA JARINGAN & ROUTING DNS',
    mapX: 1940,
    mapY: 380,
    colorHex: 0x10b981,
  },
  {
    index: 3,
    title: 'Pos Guru 4 · Studio Algoritma & Coding',
    buildingName: 'STUDIO ALGORITMA & PEMROGRAMAN',
    mapX: 460,
    mapY: 1120,
    colorHex: 0xf43f5e,
  },
  {
    index: 4,
    title: 'Pos Guru 5 · Pusat Analisis Data',
    buildingName: 'PUSAT ANALISIS DATA & STATISTIK',
    mapX: 1940,
    mapY: 1120,
    colorHex: 0xa855f7,
  },
  {
    index: 5,
    title: 'Pos Guru 6 · Markas Keamanan Siber',
    buildingName: 'MARKAS KEAMANAN SIBER & KRIPTOGRAFI',
    mapX: 1200,
    mapY: 1160,
    colorHex: 0x06b6d4,
  },
];

interface QuestHardwarePickup {
  id: number;
  name: string;
  mapX: number;
  mapY: number;
  mpValue: number;
  scoreValue: number;
  group: THREE.Group;
  active: boolean;
  respawnTimer: number;
}

interface HumanoidRig {
  group: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  nameCanvas: HTMLCanvasElement;
  nameTexture: THREE.CanvasTexture;
  lastSignature: string;
  walkPhase: number;
}

interface CyberArenaCanvasProps {
  joinedRoom: boolean;
  roomStatus: 'LOBBY' | 'PLAYING' | 'ROUND_RESULT' | 'FINISHED';
  cameraMode: 'FOLLOW_PLAYER' | 'FULL_MAP';
  localPlayerId: string;
  localPlayerName: string;
  localPlayerClass: string;
  localPlayerPreset: string;
  localPlayerColor: string;
  localPlayerRole: 'TEACHER' | 'STUDENT';
  players: MapPlayerEntity[];
  materials: InformaticsMaterial[];
  currentQuestion: InformaticsQuestion | null;
  onEmitLocalMove: (
    x: number,
    y: number,
    vx: number,
    vy: number,
    scoreBonus?: number,
    missionPointsDelta?: number,
    collectedDelta?: number
  ) => void;
  onNearbyTeacherPostChange: (post: TeacherPostLocation | null) => void;
  onNearbyVersusTargetChange: (target: MapPlayerEntity | null) => void;
  onItemPickedUpToast: (itemName: string, mpGain: number) => void;
  onLocalHudSync: (state: { x: number; y: number; hp: number }) => void;
}

// Create Procedural City Street & Grass Ground Texture (GTA San Andreas style urban grid)
function createCityDistrictTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base urban park grass & plaza stone
  ctx.fillStyle = '#14261c';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle grass turf grid
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.06)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 1024; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // Asphalt Road Network (Horizontal Boulevards & Vertical Avenues)
  const drawRoadH = (y: number, h: number) => {
    // Concrete sidewalk
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, y - 14, 1024, h + 28);
    // Dark asphalt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, y, 1024, h);
    // Double yellow/dashed center line
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.setLineDash([24, 18]);
    ctx.beginPath();
    ctx.moveTo(0, y + h / 2);
    ctx.lineTo(1024, y + h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawRoadV = (x: number, w: number) => {
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 14, 0, w + 28, 1024);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, 0, w, 1024);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    ctx.setLineDash([24, 18]);
    ctx.beginPath();
    ctx.moveTo(x + w / 2, 0);
    ctx.lineTo(x + w / 2, 1024);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  drawRoadH(260, 96);
  drawRoadH(668, 96);
  drawRoadV(260, 96);
  drawRoadV(464, 96);
  drawRoadV(668, 96);

  // Central School Courtyard Paved Plaza
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(512, 512, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, 'rgba(2, 6, 23, 0.78)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawOverheadTag(
  canvas: HTMLCanvasElement,
  title: string,
  subtitle: string,
  accentColor: string,
  isTeacher = false
) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = isTeacher ? 'rgba(24, 24, 27, 0.95)' : 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 30px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  const cleanTitle = title.length > 22 ? title.slice(0, 20) + '..' : title;
  ctx.fillText(cleanTitle, canvas.width / 2, 56);

  ctx.fillStyle = accentColor;
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillText(subtitle, canvas.width / 2, 94);
}

export const CyberArenaCanvas: React.FC<CyberArenaCanvasProps> = ({
  joinedRoom,
  roomStatus,
  cameraMode,
  localPlayerId,
  localPlayerName,
  localPlayerClass,
  localPlayerPreset,
  localPlayerColor,
  localPlayerRole,
  players,
  materials,
  currentQuestion,
  onEmitLocalMove,
  onNearbyTeacherPostChange,
  onNearbyVersusTargetChange,
  onItemPickedUpToast,
  onLocalHudSync,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const propsRef = useRef({
    joinedRoom,
    roomStatus,
    cameraMode,
    localPlayerId,
    localPlayerName,
    localPlayerClass,
    localPlayerPreset,
    localPlayerColor,
    localPlayerRole,
    players,
    materials,
    currentQuestion,
    onEmitLocalMove,
    onNearbyTeacherPostChange,
    onNearbyVersusTargetChange,
    onItemPickedUpToast,
    onLocalHudSync,
  });

  useEffect(() => {
    propsRef.current = {
      joinedRoom,
      roomStatus,
      cameraMode,
      localPlayerId,
      localPlayerName,
      localPlayerClass,
      localPlayerPreset,
      localPlayerColor,
      localPlayerRole,
      players,
      materials,
      currentQuestion,
      onEmitLocalMove,
      onNearbyTeacherPostChange,
      onNearbyVersusTargetChange,
      onItemPickedUpToast,
      onLocalHudSync,
    };
  }, [
    joinedRoom,
    roomStatus,
    cameraMode,
    localPlayerId,
    localPlayerName,
    localPlayerClass,
    localPlayerPreset,
    localPlayerColor,
    localPlayerRole,
    players,
    materials,
    currentQuestion,
    onEmitLocalMove,
    onNearbyTeacherPostChange,
    onNearbyVersusTargetChange,
    onItemPickedUpToast,
    onLocalHudSync,
  ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software-WebGL Detection (Strict Three.js Skill Standard)
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Golden-hour / twilight San Andreas urban sky atmosphere
    const horizonColor = new THREE.Color(0x132238);
    scene.background = horizonColor;
    scene.fog = new THREE.FogExp2(0x132238, 0.004);

    // 2. Mandatory Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      54,
      window.innerWidth / window.innerHeight,
      0.5,
      600
    );
    camera.position.set(0, 18, 32);

    // 3. Three-Point Warm Sunset Key + Cool Sky Hemisphere Lighting
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.9);
    hemiLight.position.set(0, 80, 0);
    scene.add(hemiLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfde68a, 1.75);
    sunKeyLight.position.set(75, 95, 65);
    sunKeyLight.castShadow = !isSoftwareGl;
    sunKeyLight.shadow.mapSize.width = 1024;
    sunKeyLight.shadow.mapSize.height = 1024;
    const d = 135;
    sunKeyLight.shadow.camera.left = -d;
    sunKeyLight.shadow.camera.right = d;
    sunKeyLight.shadow.camera.top = d;
    sunKeyLight.shadow.camera.bottom = -d;
    sunKeyLight.shadow.camera.near = 10;
    sunKeyLight.shadow.camera.far = 260;
    sunKeyLight.shadow.bias = -0.0005;
    sunKeyLight.shadow.normalBias = 0.02;
    scene.add(sunKeyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-80, 45, -60);
    scene.add(rimLight);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const cityTexture = createCityDistrictTexture(maxAnisotropy);
    const shadowTexture = createContactShadowTexture();

    // ========================================================================
    // 4. GTA SAN ANDREAS OPEN-WORLD DISTRICT GROUND & BUILDINGS
    // ========================================================================
    const outerTerrain = new THREE.Mesh(
      new THREE.PlaneGeometry(700, 700),
      new THREE.MeshStandardMaterial({ color: 0x0f1f17, roughness: 0.95, metalness: 0.05 })
    );
    outerTerrain.rotation.x = -Math.PI / 2;
    outerTerrain.position.y = -0.06;
    scene.add(outerTerrain);

    const cityGround = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 150),
      new THREE.MeshStandardMaterial({
        map: cityTexture,
        roughness: 0.75,
        metalness: 0.1,
      })
    );
    cityGround.rotation.x = -Math.PI / 2;
    cityGround.receiveShadow = !isSoftwareGl;
    scene.add(cityGround);

    // Build 6 Iconic 3D School & City Buildings + Teacher NPC Mission Markers
    const teacherMarkerMeshes: THREE.Mesh[] = [];

    // 12-Part Articulated Humanoid Builder (Used for both Students and Teacher NPCs!)
    const buildHumanoidCharacter = (
      preset: CharacterPresetConfig,
      nameText: string,
      subText: string,
      badgeColor: string,
      isTeacherNpc = false
    ): HumanoidRig => {
      const root = new THREE.Group();

      // 1. Contact Shadow Disc flush at y = 0.03
      const shadowDisc = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 3.2),
        new THREE.MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          depthWrite: false,
          opacity: 0.7,
        })
      );
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.03;
      root.add(shadowDisc);

      const skinMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(preset.skinColor),
        roughness: 0.55,
        metalness: 0.05,
      });
      const jacketMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(preset.jacketColor),
        roughness: 0.4,
        metalness: 0.2,
      });
      const shirtMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(preset.shirtColor),
        roughness: 0.6,
        metalness: 0.1,
      });
      const pantsMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(preset.pantsColor),
        roughness: 0.7,
        metalness: 0.1,
      });
      const shoeMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.3,
        metalness: 0.2,
      });

      // 2 & 3. Articulated Left & Right Legs (Thigh + Calf + Sneaker)
      const createLegGroup = () => {
        const legPivot = new THREE.Group();
        const thigh = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.28, 0.75, 6, 12),
          pantsMat
        );
        thigh.position.y = -0.55;
        thigh.castShadow = !isSoftwareGl;
        legPivot.add(thigh);

        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.36, 0.95), shoeMat);
        shoe.position.set(0, -1.32, 0.14);
        legPivot.add(shoe);
        return legPivot;
      };

      const leftLegPivot = createLegGroup();
      leftLegPivot.position.set(-0.38, 1.5, 0);
      root.add(leftLegPivot);

      const rightLegPivot = createLegGroup();
      rightLegPivot.position.set(0.38, 1.5, 0);
      root.add(rightLegPivot);

      // 4. Layered Jacket & Inner Shirt Torso
      const torsoOuter = new THREE.Mesh(
        new THREE.BoxGeometry(1.48, 1.65, 0.82),
        jacketMat
      );
      torsoOuter.position.set(0, 2.32, 0);
      torsoOuter.castShadow = !isSoftwareGl;
      root.add(torsoOuter);

      const shirtFront = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 1.58, 0.86),
        shirtMat
      );
      shirtFront.position.set(0, 2.32, 0);
      root.add(shirtFront);

      // 5. Street Backpack (for Students) or Golden Emblem Badge (for Teacher)
      if (!isTeacherNpc) {
        const backpack = new THREE.Mesh(
          new THREE.BoxGeometry(1.05, 1.15, 0.48),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 })
        );
        backpack.position.set(0, 2.38, -0.58);
        root.add(backpack);
      }

      // 6 & 7. Articulated Left & Right Arms (Sleeve + Forearm + Hand)
      const createArmGroup = () => {
        const armPivot = new THREE.Group();
        const upperArm = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.24, 0.65, 6, 10),
          jacketMat
        );
        upperArm.position.y = -0.45;
        upperArm.castShadow = !isSoftwareGl;
        armPivot.add(upperArm);

        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.23, 10, 10), skinMat);
        hand.position.y = -1.05;
        armPivot.add(hand);
        return armPivot;
      };

      const leftArmPivot = createArmGroup();
      leftArmPivot.position.set(-0.98, 2.98, 0);
      root.add(leftArmPivot);

      const rightArmPivot = createArmGroup();
      rightArmPivot.position.set(0.98, 2.98, 0);
      root.add(rightArmPivot);

      // 8. Sculpted Humanoid Head + Neck + Aviator Sunglasses + Cap/Hair
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.35, 12), skinMat);
      neck.position.set(0, 3.25, 0);
      root.add(neck);

      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.62, 18, 18), skinMat);
      headMesh.position.set(0, 3.85, 0);
      headMesh.castShadow = !isSoftwareGl;
      root.add(headMesh);

      // Cool GTA-style Sunglasses / Cyber Visor on Front (+Z)
      const shades = new THREE.Mesh(
        new THREE.BoxGeometry(0.88, 0.24, 0.25),
        new THREE.MeshStandardMaterial({
          color: isTeacherNpc ? 0xfbbf24 : 0x09090b,
          roughness: 0.15,
          metalness: 0.85,
        })
      );
      shades.position.set(0, 3.9, 0.52);
      root.add(shades);

      // Cap / Hair / Hijab
      const hairMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(preset.hairColor),
        roughness: 0.6,
      });
      if (preset.hatStyle === 'CAP') {
        const capCrown = new THREE.Mesh(
          new THREE.CylinderGeometry(0.62, 0.64, 0.35, 16),
          jacketMat
        );
        capCrown.position.set(0, 4.25, 0);
        const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.1, 0.55), jacketMat);
        capVisor.position.set(0, 4.14, 0.52);
        root.add(capCrown, capVisor);
      } else if (preset.hatStyle === 'HIJAB') {
        const hijab = new THREE.Mesh(new THREE.SphereGeometry(0.68, 16, 16), shirtMat);
        hijab.position.set(0, 3.88, -0.05);
        root.add(hijab);
      } else {
        const hairTop = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.38, 1.12), hairMat);
        hairTop.position.set(0, 4.32, -0.04);
        root.add(hairTop);
      }

      // 9. Overhead Nameplate Sprite
      const nameCanvas = document.createElement('canvas');
      nameCanvas.width = 512;
      nameCanvas.height = 128;
      const nameTexture = new THREE.CanvasTexture(nameCanvas);
      nameTexture.colorSpace = THREE.SRGBColorSpace;
      nameTexture.anisotropy = maxAnisotropy;

      drawOverheadTag(nameCanvas, nameText, subText, badgeColor, isTeacherNpc);

      const nameSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: nameTexture, transparent: true, depthWrite: false })
      );
      nameSprite.position.set(0, 5.5, 0);
      nameSprite.scale.set(7.2, 1.8, 1);
      root.add(nameSprite);

      return {
        group: root,
        leftArmPivot,
        rightArmPivot,
        leftLegPivot,
        rightLegPivot,
        nameCanvas,
        nameTexture,
        lastSignature: '',
        walkPhase: 0,
      };
    };

    // Place 6 Major Buildings + 6 Pak Azhary Teacher Quest Posts with GTA Mission Markers
    TEACHER_POSTS.forEach((post) => {
      const bx = to3DX(post.mapX);
      const bz = to3DZ(post.mapY);

      const bGroup = new THREE.Group();
      const bOffsetZ = post.mapY < 750 ? -13 : 13;
      bGroup.position.set(bx, 0, bz + bOffsetZ);

      // Main Architectural Building Block
      const bWidth = 28;
      const bHeight = post.index === 0 ? 16 : 12.5;
      const bDepth = 14;
      const buildingMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth, bHeight, bDepth),
        new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.45,
          metalness: 0.5,
        })
      );
      buildingMesh.position.y = bHeight / 2;
      buildingMesh.castShadow = !isSoftwareGl;
      buildingMesh.receiveShadow = !isSoftwareGl;
      bGroup.add(buildingMesh);

      // Glowing Neon Roof Cornice
      const roofTrim = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth + 0.8, 0.7, bDepth + 0.8),
        new THREE.MeshStandardMaterial({
          color: post.colorHex,
          emissive: post.colorHex,
          emissiveIntensity: 0.8,
        })
      );
      roofTrim.position.y = bHeight + 0.35;
      bGroup.add(roofTrim);

      // Illuminated Windows Strip
      const winMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth - 4, 2.4, bDepth + 0.2),
        new THREE.MeshStandardMaterial({
          color: 0xbae6fd,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.45,
          roughness: 0.2,
        })
      );
      winMesh.position.y = bHeight * 0.58;
      bGroup.add(winMesh);

      scene.add(bGroup);

      // Teacher NPC (Pak Azhary Mardhani, S.Kom) standing in front of the building inside a GTA Mission Cylinder!
      const teacherRig = buildHumanoidCharacter(
        {
          id: 'teacher_azhary',
          name: 'Azhary Mardhani, S.Kom',
          tagline: 'Guru Informatika MTsN 14',
          jacketColor: '#b45309',
          shirtColor: '#fef3c7',
          pantsColor: '#0f172a',
          skinColor: '#e0ac69',
          hairColor: '#0f172a',
          hatStyle: 'NONE',
        },
        post.title,
        '★ POS SOAL GURU [TEKAN F]',
        '#fbbf24',
        true
      );
      teacherRig.group.position.set(bx, 0, bz);
      if (post.mapY > 750) {
        teacherRig.group.rotation.y = Math.PI;
      }
      scene.add(teacherRig.group);

      // Glowing GTA San Andreas Cylindrical Mission Marker around Teacher NPC
      const markerGeo = new THREE.CylinderGeometry(3.4, 3.4, 5.5, 28, 1, true);
      const markerMat = new THREE.MeshBasicMaterial({
        color: post.colorHex,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const markerCylinder = new THREE.Mesh(markerGeo, markerMat);
      markerCylinder.position.set(bx, 2.75, bz);
      scene.add(markerCylinder);
      teacherMarkerMeshes.push(markerCylinder);
    });

    // ========================================================================
    // 5. 10 COLLECTIBLE HARDWARE & DATA QUEST ITEMS ON THE STREETS
    // ========================================================================
    const HARDWARE_ITEM_NAMES = [
      'Prosesor ALU Core-14',
      'Router Wi-Fi MTsN 14',
      'Kabel Fiber Optik',
      'Modul RAM DDR5 16GB',
      'Chip Kriptografi Caesar',
      'Flashdisk Algoritma',
      'Switch Topologi Star',
      'Sensor IoT Lab',
      'SSD NVMe Server',
      'Firewall Security Key',
    ];

    const itemPickups: QuestHardwarePickup[] = HARDWARE_ITEM_NAMES.map((itemName, idx) => {
      const angle = (idx / HARDWARE_ITEM_NAMES.length) * Math.PI * 2;
      const radX = idx % 2 === 0 ? 360 : 620;
      const radY = idx % 2 === 0 ? 220 : 360;
      const mx = WORLD_WIDTH / 2 + Math.cos(angle) * radX;
      const my = WORLD_HEIGHT / 2 + Math.sin(angle) * radY;

      const itemGroup = new THREE.Group();
      itemGroup.position.set(to3DX(mx), 0, to3DZ(my));

      // Green GTA Pickup Ring on Ground
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.5, 2.1, 24),
        new THREE.MeshBasicMaterial({
          color: 0x10b981,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.08;
      itemGroup.add(ring);

      // 3D Hardware Crate + Glowing Microchip Core
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 1.3, 1.3),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.7,
          roughness: 0.2,
          metalness: 0.6,
        })
      );
      box.position.y = 1.6;
      box.name = 'spinningBox';
      itemGroup.add(box);

      scene.add(itemGroup);

      return {
        id: idx + 1,
        name: itemName,
        mapX: mx,
        mapY: my,
        mpValue: 50,
        scoreValue: 50,
        group: itemGroup,
        active: true,
        respawnTimer: 0,
      };
    });

    // ========================================================================
    // 6. INSTANCED PALM TREES & STREETLAMPS ACROSS THE DISTRICT
    // ========================================================================
    const treeCount = 48;
    const trunkInst = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.35, 0.55, 6.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.85 }),
      treeCount
    );
    const canopyInst = new THREE.InstancedMesh(
      new THREE.DodecahedronGeometry(2.6, 0),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 }),
      treeCount
    );

    for (let i = 0; i < treeCount; i++) {
      const ang = (i / treeCount) * Math.PI * 2;
      const rx = 112 + (i % 3) * 10;
      const rz = 68 + (i % 3) * 8;
      const tx = Math.cos(ang) * rx;
      const tz = Math.sin(ang) * rz;

      _dummyObj.position.set(tx, 3.25, tz);
      _dummyObj.rotation.set(0, i, 0);
      _dummyObj.scale.setScalar(1);
      _dummyObj.updateMatrix();
      trunkInst.setMatrixAt(i, _dummyObj.matrix);

      _dummyObj.position.set(tx, 7.2, tz);
      _dummyObj.updateMatrix();
      canopyInst.setMatrixAt(i, _dummyObj.matrix);
    }
    trunkInst.instanceMatrix.needsUpdate = true;
    canopyInst.instanceMatrix.needsUpdate = true;
    trunkInst.computeBoundingSphere();
    canopyInst.computeBoundingSphere();
    scene.add(trunkInst, canopyInst);

    // ========================================================================
    // 7. PLAYER & CLASSMATE HUMANOID RIG MANAGEMENT
    // ========================================================================
    const playerRigs = new Map<string, HumanoidRig>();

    const getPresetById = (presetId?: string): CharacterPresetConfig => {
      return (
        CHARACTER_PRESETS.find((p) => p.id === presetId) || CHARACTER_PRESETS[0]
      );
    };

    const heldKeys = new Set<string>();
    const justPressedKeys = new Set<string>();
    let cameraYaw = 0;
    let cameraPitch = 0.42;
    let cameraDist = 21;
    let isDraggingOrbit = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    let localMapX = WORLD_WIDTH / 2;
    let localMapY = WORLD_HEIGHT / 2 + 120;
    let localJumpY = 0;
    let localJumpVy = 0;
    let localDashTimer = 0;
    let localDashCooldown = 0;
    let localFacingAngle = Math.PI;
    let localWalkPhase = 0;
    let lastNearbyTeacherIdx: number | null = null;
    let lastNearbyVersusId: string | null = null;
    let wsEmitCooldown = 0;
    let hudSyncCooldown = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!heldKeys.has(e.code)) {
        justPressedKeys.add(e.code);
      }
      heldKeys.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      heldKeys.delete(e.code);
    };

    const handleBlur = () => {
      heldKeys.clear();
      justPressedKeys.clear();
      isDraggingOrbit = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2 || e.button === 0) {
        isDraggingOrbit = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingOrbit) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      cameraYaw -= dx * 0.0065;
      cameraPitch = THREE.MathUtils.clamp(cameraPitch + dy * 0.005, 0.16, 1.25);
    };

    const handleMouseUp = () => {
      isDraggingOrbit = false;
    };

    const handleWheel = (e: WheelEvent) => {
      cameraDist = THREE.MathUtils.clamp(cameraDist + e.deltaY * 0.02, 11, 48);
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: true });
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let frameId = 0;
    let isDisposed = false;
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const clock = new THREE.Clock();

    function tick() {
      if (isDisposed) return;
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = clock.getElapsedTime();
      const currentProps = propsRef.current;

      // Animate Teacher Mission Cylinders
      teacherMarkerMeshes.forEach((cyl, idx) => {
        cyl.rotation.y = elapsed * 0.8 + idx;
        const s = 1 + Math.sin(elapsed * 3 + idx) * 0.06;
        cyl.scale.set(s, 1, s);
      });

      // ======================================================================
      // UPDATE LOCAL HUMANOID IN GTA OPEN-WORLD DISTRICT
      // ======================================================================
      if (currentProps.joinedRoom) {
        if (heldKeys.has('KeyQ')) cameraYaw += 1.8 * dt;
        if (heldKeys.has('KeyE')) cameraYaw -= 1.8 * dt;

        let forwardInput = 0;
        let rightInput = 0;
        if (heldKeys.has('KeyW') || heldKeys.has('ArrowUp')) forwardInput += 1;
        if (heldKeys.has('KeyS') || heldKeys.has('ArrowDown')) forwardInput -= 1;
        if (heldKeys.has('KeyD') || heldKeys.has('ArrowRight')) rightInput += 1;
        if (heldKeys.has('KeyA') || heldKeys.has('ArrowLeft')) rightInput -= 1;

        let moveX = 0;
        let moveY = 0;
        if (forwardInput !== 0 || rightInput !== 0) {
          const sinY = Math.sin(cameraYaw);
          const cosY = Math.cos(cameraYaw);
          const rawX = -sinY * forwardInput + cosY * rightInput;
          const rawZ = -cosY * forwardInput - sinY * rightInput;
          const len = Math.hypot(rawX, rawZ) || 1;
          moveX = rawX / len;
          moveY = rawZ / len;
        }

        localDashCooldown = Math.max(0, localDashCooldown - dt);
        localDashTimer = Math.max(0, localDashTimer - dt);

        if (justPressedKeys.has('Space')) {
          if (localJumpY <= 0.01) {
            localJumpVy = 17.5;
            soundEngine.playDash();
          }
          if (localDashCooldown <= 0) {
            localDashCooldown = 0.65;
            localDashTimer = 0.25;
          }
        }

        if (localJumpY > 0 || localJumpVy > 0) {
          localJumpY += localJumpVy * dt;
          localJumpVy -= 45 * dt;
          if (localJumpY <= 0) {
            localJumpY = 0;
            localJumpVy = 0;
          }
        }

        const speed =
          heldKeys.has('ShiftLeft') || localDashTimer > 0 ? 640 : 410;
        const vx = moveX * speed;
        const vy = moveY * speed;
        localMapX = THREE.MathUtils.clamp(localMapX + vx * dt, 70, WORLD_WIDTH - 70);
        localMapY = THREE.MathUtils.clamp(localMapY + vy * dt, 70, WORLD_HEIGHT - 70);

        if (Math.hypot(moveX, moveY) > 0.05) {
          const targetAng = Math.atan2(moveX, moveY);
          let diff = targetAng - localFacingAngle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          localFacingAngle += diff * Math.min(1, dt * 14);
          localWalkPhase += dt * (speed > 500 ? 16 : 11);
        } else {
          localWalkPhase = 0;
        }

        // 1. Check Proximity to 6 Teacher Quest Posts (Pak Azhary Mardhani, S.Kom)
        let nearestPost: TeacherPostLocation | null = null;
        for (const post of TEACHER_POSTS) {
          if (Math.hypot(localMapX - post.mapX, localMapY - post.mapY) <= 95) {
            nearestPost = post;
            break;
          }
        }
        const postIdx = nearestPost ? nearestPost.index : null;
        if (postIdx !== lastNearbyTeacherIdx) {
          lastNearbyTeacherIdx = postIdx;
          currentProps.onNearbyTeacherPostChange(nearestPost);
        }

        // 2. Check Proximity to Other Students on the Map (Versus 1v1 Trigger!)
        let nearestPeer: MapPlayerEntity | null = null;
        let minPeerDist = 115;
        for (const rp of currentProps.players) {
          if (rp.id === currentProps.localPlayerId) continue;
          const dist = Math.hypot(localMapX - rp.x, localMapY - rp.y);
          if (dist < minPeerDist) {
            minPeerDist = dist;
            nearestPeer = rp;
          }
        }
        const peerId = nearestPeer ? nearestPeer.id : null;
        if (peerId !== lastNearbyVersusId) {
          lastNearbyVersusId = peerId;
          currentProps.onNearbyVersusTargetChange(nearestPeer);
        }

        // 3. Check Collectible Hardware Quest Items
        let scoreGain = 0;
        let mpGain = 0;
        let itemsCountGain = 0;

        for (const item of itemPickups) {
          if (!item.active) {
            item.respawnTimer -= dt;
            if (item.respawnTimer <= 0) {
              item.active = true;
              item.group.visible = true;
            }
            continue;
          }
          const box = item.group.getObjectByName('spinningBox');
          if (box) {
            box.rotation.y = elapsed * 2;
            box.position.y = 1.6 + Math.sin(elapsed * 3 + item.id) * 0.25;
          }

          if (Math.hypot(localMapX - item.mapX, localMapY - item.mapY) <= 50) {
            item.active = false;
            item.respawnTimer = 12;
            item.group.visible = false;
            scoreGain += item.scoreValue;
            mpGain += item.mpValue;
            itemsCountGain += 1;
            soundEngine.playPickupData();
            currentProps.onItemPickedUpToast(item.name, item.mpValue);
          }
        }

        wsEmitCooldown -= dt;
        if (wsEmitCooldown <= 0 || scoreGain > 0 || mpGain > 0) {
          wsEmitCooldown = 0.08;
          currentProps.onEmitLocalMove(
            Math.round(localMapX),
            Math.round(localMapY),
            Math.round(vx),
            Math.round(vy),
            scoreGain,
            mpGain,
            itemsCountGain
          );
        }

        hudSyncCooldown -= dt;
        if (hudSyncCooldown <= 0) {
          hudSyncCooldown = 0.12;
          currentProps.onLocalHudSync({
            x: Math.round(localMapX),
            y: Math.round(localMapY),
            hp: 100,
          });
        }
      }

      // ======================================================================
      // SYNC & ANIMATE ALL 3D HUMANOID STUDENT CHARACTERS
      // ======================================================================
      const activeIds = new Set<string>();
      const localRec = currentProps.players.find((p) => p.id === currentProps.localPlayerId);
      const localMp = localRec?.missionPoints ?? 100;
      const localScore = localRec?.score ?? 0;

      if (currentProps.joinedRoom) {
        activeIds.add(currentProps.localPlayerId);
        const preset = getPresetById(currentProps.localPlayerPreset);
        let localRig = playerRigs.get(currentProps.localPlayerId);
        if (!localRig) {
          localRig = buildHumanoidCharacter(
            preset,
            currentProps.localPlayerName,
            `${currentProps.localPlayerClass} · ${localMp} MP`,
            '#38bdf8',
            false
          );
          scene.add(localRig.group);
          playerRigs.set(currentProps.localPlayerId, localRig);
        }

        localRig.group.position.set(to3DX(localMapX), localJumpY, to3DZ(localMapY));
        localRig.group.rotation.y = localFacingAngle;

        const swing =
          localJumpY > 0.15 ? 0.8 : Math.sin(localWalkPhase) * (localWalkPhase > 0 ? 0.65 : 0);
        localRig.leftLegPivot.rotation.x = swing;
        localRig.rightLegPivot.rotation.x = -swing;
        localRig.leftArmPivot.rotation.x = -swing * 0.85;
        localRig.rightArmPivot.rotation.x = swing * 0.85;

        const sig = `${currentProps.localPlayerName}|${currentProps.localPlayerClass}|${localMp}|${localScore}`;
        if (localRig.lastSignature !== sig) {
          localRig.lastSignature = sig;
          drawOverheadTag(
            localRig.nameCanvas,
            currentProps.localPlayerName,
            `${currentProps.localPlayerClass} · ${localMp} MP · $${localScore}`,
            '#38bdf8',
            false
          );
          localRig.nameTexture.needsUpdate = true;
        }
      }

      for (const rp of currentProps.players) {
        if (rp.id === currentProps.localPlayerId) continue;
        activeIds.add(rp.id);

        let rig = playerRigs.get(rp.id);
        if (!rig) {
          const preset = getPresetById(rp.characterPreset);
          rig = buildHumanoidCharacter(
            preset,
            rp.name,
            `${rp.studentClass} · [V] VERSUS`,
            '#fbbf24',
            false
          );
          rig.group.position.set(to3DX(rp.x), 0, to3DZ(rp.y));
          scene.add(rig.group);
          playerRigs.set(rp.id, rig);
        }

        const tx = to3DX(rp.x);
        const tz = to3DZ(rp.y);
        const dx = tx - rig.group.position.x;
        const dz = tz - rig.group.position.z;
        const distMoved = Math.hypot(dx, dz);

        rig.group.position.x = THREE.MathUtils.damp(rig.group.position.x, tx, 8, dt);
        rig.group.position.z = THREE.MathUtils.damp(rig.group.position.z, tz, 8, dt);

        if (distMoved > 0.05) {
          const targetRot = Math.atan2(dx, dz);
          rig.group.rotation.y = THREE.MathUtils.damp(rig.group.rotation.y, targetRot, 10, dt);
          rig.walkPhase += dt * 9;
          const sw = Math.sin(rig.walkPhase) * 0.55;
          rig.leftLegPivot.rotation.x = sw;
          rig.rightLegPivot.rotation.x = -sw;
          rig.leftArmPivot.rotation.x = -sw * 0.8;
          rig.rightArmPivot.rotation.x = sw * 0.8;
        } else {
          rig.leftLegPivot.rotation.x = THREE.MathUtils.damp(rig.leftLegPivot.rotation.x, 0, 8, dt);
          rig.rightLegPivot.rotation.x = THREE.MathUtils.damp(
            rig.rightLegPivot.rotation.x,
            0,
            8,
            dt
          );
        }

        const sig = `${rp.name}|${rp.studentClass}|${rp.score}`;
        if (rig.lastSignature !== sig) {
          rig.lastSignature = sig;
          drawOverheadTag(
            rig.nameCanvas,
            rp.name,
            `${rp.studentClass} · [TEKAN V VERSUS]`,
            '#fbbf24',
            false
          );
          rig.nameTexture.needsUpdate = true;
        }
      }

      for (const [id, rig] of playerRigs.entries()) {
        if (!activeIds.has(id)) {
          scene.remove(rig.group);
          rig.nameTexture.dispose();
          playerRigs.delete(id);
        }
      }

      // ======================================================================
      // GTA THIRD-PERSON CAMERA vs BIRD'S-EYE FULL DISTRICT CAMERA
      // ======================================================================
      if (!currentProps.joinedRoom) {
        const orbitAngle = elapsed * 0.2;
        _vec3A.set(Math.cos(orbitAngle) * 76, 34, Math.sin(orbitAngle) * 76);
        camera.position.lerp(_vec3A, Math.min(1, dt * 3));
        camera.lookAt(0, 4, 0);
      } else if (currentProps.cameraMode === 'FULL_MAP') {
        _vec3A.set(0, 140, 88);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _vec3A.x, 6, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _vec3A.y, 6, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _vec3A.z, 6, dt);
        camera.lookAt(0, 0, 2);
      } else {
        const px = to3DX(localMapX);
        const pz = to3DZ(localMapY);
        const camOffsetX = Math.sin(cameraYaw) * Math.cos(cameraPitch) * cameraDist;
        const camOffsetY = Math.sin(cameraPitch) * cameraDist + 3.6;
        const camOffsetZ = Math.cos(cameraYaw) * Math.cos(cameraPitch) * cameraDist;

        camera.position.x = THREE.MathUtils.damp(camera.position.x, px + camOffsetX, 10, dt);
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          localJumpY + camOffsetY,
          10,
          dt
        );
        camera.position.z = THREE.MathUtils.damp(camera.position.z, pz + camOffsetZ, 10, dt);

        _vec3B.set(px, localJumpY + 3.4, pz);
        camera.lookAt(_vec3B);
      }

      // ======================================================================
      // RENDER GTA SAN ANDREAS CIRCULAR RADAR MINI-MAP (Bottom-Left)
      // ======================================================================
      const radarCanvas = radarCanvasRef.current;
      if (radarCanvas && currentProps.joinedRoom) {
        const rCtx = radarCanvas.getContext('2d');
        if (rCtx) {
          const rw = radarCanvas.width;
          const rh = radarCanvas.height;
          const cx = rw / 2;
          const cy = rh / 2;
          const radius = rw / 2 - 6;

          rCtx.clearRect(0, 0, rw, rh);
          rCtx.save();

          // Circular Radar Clip
          rCtx.beginPath();
          rCtx.arc(cx, cy, radius, 0, Math.PI * 2);
          rCtx.clip();

          // Dark Radar Backing
          rCtx.fillStyle = 'rgba(9, 16, 34, 0.94)';
          rCtx.fillRect(0, 0, rw, rh);

          const scaleMap = 0.085;
          // Draw Relative Road Crosshairs
          rCtx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          rCtx.lineWidth = 6;
          rCtx.beginPath();
          const hubDx = (WORLD_WIDTH / 2 - localMapX) * scaleMap;
          const hubDy = (WORLD_HEIGHT / 2 - localMapY) * scaleMap;
          rCtx.moveTo(cx + hubDx - 120, cy + hubDy);
          rCtx.lineTo(cx + hubDx + 120, cy + hubDy);
          rCtx.moveTo(cx + hubDx, cy + hubDy - 120);
          rCtx.lineTo(cx + hubDx, cy + hubDy + 120);
          rCtx.stroke();

          // 1. Green Blips for Collectible Quest Items
          for (const it of itemPickups) {
            if (!it.active) continue;
            const ix = cx + (it.mapX - localMapX) * scaleMap;
            const iy = cy + (it.mapY - localMapY) * scaleMap;
            rCtx.fillStyle = '#10b981';
            rCtx.fillRect(ix - 3, iy - 3, 6, 6);
          }

          // 2. Yellow 'G' Icons for Teacher Posts (Pak Azhary Mardhani, S.Kom)
          for (const post of TEACHER_POSTS) {
            const gx = cx + (post.mapX - localMapX) * scaleMap;
            const gy = cy + (post.mapY - localMapY) * scaleMap;
            rCtx.fillStyle = '#fbbf24';
            rCtx.beginPath();
            rCtx.arc(gx, gy, 6.5, 0, Math.PI * 2);
            rCtx.fill();
            rCtx.fillStyle = '#020617';
            rCtx.font = '800 9px "JetBrains Mono", monospace';
            rCtx.textAlign = 'center';
            rCtx.fillText('G', gx, gy + 3);
          }

          // 3. Orange/Cyan Blips for Other Students (Versus Targets)
          for (const rp of currentProps.players) {
            if (rp.id === currentProps.localPlayerId) continue;
            const px = cx + (rp.x - localMapX) * scaleMap;
            const py = cy + (rp.y - localMapY) * scaleMap;
            rCtx.fillStyle = '#f43f5e';
            rCtx.beginPath();
            rCtx.arc(px, py, 5, 0, Math.PI * 2);
            rCtx.fill();
          }

          // 4. Center Local Player Arrow
          rCtx.fillStyle = '#ffffff';
          rCtx.strokeStyle = '#0ea5e9';
          rCtx.lineWidth = 2;
          rCtx.beginPath();
          rCtx.arc(cx, cy, 5, 0, Math.PI * 2);
          rCtx.fill();
          rCtx.stroke();

          rCtx.restore();

          // Thick GTA-Style Outer Radar Ring
          rCtx.strokeStyle = '#334155';
          rCtx.lineWidth = 5;
          rCtx.beginPath();
          rCtx.arc(cx, cy, radius, 0, Math.PI * 2);
          rCtx.stroke();

          // North ('N') Badge at Top of Radar
          rCtx.fillStyle = '#0f172a';
          rCtx.strokeStyle = '#fbbf24';
          rCtx.lineWidth = 2;
          rCtx.beginPath();
          rCtx.arc(cx, 11, 9, 0, Math.PI * 2);
          rCtx.fill();
          rCtx.stroke();
          rCtx.fillStyle = '#fbbf24';
          rCtx.font = '800 10px "JetBrains Mono", monospace';
          rCtx.textAlign = 'center';
          rCtx.fillText('N', cx, 14.5);
        }
      }

      justPressedKeys.clear();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      cityTexture.dispose();
      shadowTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950">
      <div ref={mountRef} className="w-full h-full" />
      {/* GTA San Andreas Circular Radar Mini-Map in Bottom-Left */}
      {joinedRoom && (
        <div className="fixed bottom-5 left-5 z-20 pointer-events-none hidden sm:flex flex-col items-center gap-1">
          <canvas
            ref={radarCanvasRef}
            width={156}
            height={156}
            className="block rounded-full shadow-2xl"
          />
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-0.5 rounded border border-slate-800">
            G: Pos Guru · ■: Barang · ●: Siswa
          </span>
        </div>
      )}
    </div>
  );
};
