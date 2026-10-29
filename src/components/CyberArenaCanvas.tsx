import React, { useEffect, useRef, useState } from 'react';
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
  facingAngle?: number;
  jumpY?: number;
  score: number;
  missionPoints?: number;
  collectedItemsCount?: number;
  answeredCount?: number;
  streak: number;
  hp: number;
  currentSector: OptionKey | null;
  lockedOption: OptionKey | null;
  lastChatText?: string;
  lastChatTime?: number;
  lastUpdated?: number;
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
    title: 'Pak Azhary · Gedung Utama & Ruang Guru',
    buildingName: 'GEDUNG UTAMA & PTSP MTsN 14 HALIM',
    mapX: 1200,
    mapY: 360,
    colorHex: 0xf59e0b,
  },
  {
    index: 1,
    title: 'Pak Azhary · Lab Komputer & Informatika',
    buildingName: 'LAB KOMPUTER & MULTIMEDIA MTsN 14',
    mapX: 460,
    mapY: 380,
    colorHex: 0x0ea5e9,
  },
  {
    index: 2,
    title: 'Pak Azhary · Masjid Al-Ikhlas MTsN 14',
    buildingName: 'MASJID AL-IKHLAS MTsN 14 HALIM',
    mapX: 1940,
    mapY: 380,
    colorHex: 0x10b981,
  },
  {
    index: 3,
    title: 'Pak Azhary · Gedung Kelas 7, 8, 9 & Perpus',
    buildingName: 'GEDUNG KELAS 7-8-9 & PERPUSTAKAAN',
    mapX: 460,
    mapY: 1120,
    colorHex: 0xf43f5e,
  },
  {
    index: 4,
    title: 'Pak Azhary · Aula Serbaguna & Ruang UKS',
    buildingName: 'AULA SERBAGUNA & UKS MTsN 14 HALIM',
    mapX: 1940,
    mapY: 1120,
    colorHex: 0xa855f7,
  },
  {
    index: 5,
    title: 'Pak Azhary · Gerbang Jl. Elang Halim & Kantin',
    buildingName: 'GERBANG JL. ELANG KOMP. RAJAWALI HALIM',
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
  presetId: string;
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
  teleportCommand?: { x: number; y: number; seq: number } | null;
  localChatBubble?: { text: string; timestamp: number } | null;
  onEmitLocalMove: (
    x: number,
    y: number,
    vx: number,
    vy: number,
    facingAngle: number,
    jumpY: number,
    scoreBonus?: number,
    missionPointsDelta?: number,
    collectedDelta?: number
  ) => void;
  onNearbyTeacherPostChange: (post: TeacherPostLocation | null) => void;
  onNearbyVersusTargetChange: (target: MapPlayerEntity | null) => void;
  onItemPickedUpToast: (itemName: string, mpGain: number) => void;
  onLocalHudSync: (state: { x: number; y: number; hp: number }) => void;
}

// Create Procedural MTs Negeri 14 Jakarta Timur (Kampus Halim Perdanakusuma) Ground Texture
function createCityDistrictTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Lush Madrasah green courtyard & Halim Perdanakusuma complex grounds
  ctx.fillStyle = '#143323';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle paving & grass grid
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 1024; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // Komplek Rajawali & Jl. Elang Halim Asphalt Roads + Paved Madrasah Corridors
  const drawRoadH = (y: number, h: number) => {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, y - 12, 1024, h + 24);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, y, 1024, h);
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
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x - 12, 0, w + 24, 1024);
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

  drawRoadH(255, 86);
  drawRoadH(680, 92); // Jl. Elang Komplek Rajawali Halim
  drawRoadV(240, 84);
  drawRoadV(470, 84);
  drawRoadV(700, 84);

  // ============================================================================
  // LAPANGAN UPACARA & OLAHRAGA MTs NEGERI 14 JAKARTA TIMUR (FUTSAL & BASKET)
  // ============================================================================
  const courtX = 330;
  const courtY = 365;
  const courtW = 364;
  const courtH = 290;

  // Outer terracotta jogging/ceremony border
  ctx.fillStyle = '#9a3412';
  ctx.beginPath();
  ctx.roundRect(courtX - 18, courtY - 18, courtW + 36, courtH + 36, 16);
  ctx.fill();

  // Inner Emerald Green Multifunction Court (Khas Lapangan Madrasah Jakarta)
  ctx.fillStyle = '#047857';
  ctx.fillRect(courtX, courtY, courtW, courtH);

  // White Court Lines (Garis Lapangan Futsal / Basket)
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 5;
  ctx.strokeRect(courtX + 10, courtY + 10, courtW - 20, courtH - 20);

  // Center Line & Center Circle
  ctx.beginPath();
  ctx.moveTo(courtX + courtW / 2, courtY + 10);
  ctx.lineTo(courtX + courtW / 2, courtY + courtH - 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(courtX + courtW / 2, courtY + courtH / 2, 42, 0, Math.PI * 2);
  ctx.stroke();

  // Left & Right Penalty / Key Areas
  ctx.strokeRect(courtX + 10, courtY + courtH / 2 - 55, 58, 110);
  ctx.strokeRect(courtX + courtW - 68, courtY + courtH / 2 - 55, 58, 110);

  // School Name Painted on Courtyard
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.font = '800 22px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LAPANGAN UPACARA MTs NEGERI 14 JAKARTA', 512, courtY + 42);
  ctx.fillStyle = '#fde68a';
  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.fillText('JL. ELANG · KOMP. RAJAWALI HALIM PERDANAKUSUMA', 512, courtY + courtH - 22);

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
  isTeacher = false,
  chatBubbleText = ''
) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Optional Roblox-Style Overhead Speech Bubble (Top half of canvas: y = 6..102)
  if (chatBubbleText && chatBubbleText.trim().length > 0) {
    const cleanChat =
      chatBubbleText.length > 36 ? chatBubbleText.slice(0, 34) + '..' : chatBubbleText;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(18, 8, canvas.width - 36, 76, 22);
    ctx.fill();
    ctx.stroke();

    // Speech pointer triangle pointing down to avatar head
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 14, 84);
    ctx.lineTo(canvas.width / 2 + 14, 84);
    ctx.lineTo(canvas.width / 2, 102);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`"${cleanChat}"`, canvas.width / 2, 54);
  }

  // 2. Overhead Nameplate Badge (Bottom half of canvas: y = 108..212)
  const tagY = 108;
  const tagH = 104;
  ctx.fillStyle = isTeacher ? 'rgba(24, 24, 27, 0.95)' : 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(10, tagY, canvas.width - 20, tagH, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 29px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  const cleanTitle = title.length > 22 ? title.slice(0, 20) + '..' : title;
  ctx.fillText(cleanTitle, canvas.width / 2, tagY + 46);

  ctx.fillStyle = accentColor;
  ctx.font = '700 21px "JetBrains Mono", monospace';
  ctx.fillText(subtitle, canvas.width / 2, tagY + 82);
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
  teleportCommand,
  localChatBubble,
  onEmitLocalMove,
  onNearbyTeacherPostChange,
  onNearbyVersusTargetChange,
  onItemPickedUpToast,
  onLocalHudSync,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mobileJumpQueuedRef = useRef<boolean>(false);
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joystickKnob, setJoystickKnob] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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
    teleportCommand,
    localChatBubble,
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
      teleportCommand,
      localChatBubble,
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
    teleportCommand,
    localChatBubble,
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

      // 9. Overhead Nameplate + Roblox Speech Bubble Sprite
      const nameCanvas = document.createElement('canvas');
      nameCanvas.width = 512;
      nameCanvas.height = 220;
      const nameTexture = new THREE.CanvasTexture(nameCanvas);
      nameTexture.colorSpace = THREE.SRGBColorSpace;
      nameTexture.anisotropy = maxAnisotropy;

      drawOverheadTag(nameCanvas, nameText, subText, badgeColor, isTeacherNpc, '');

      const nameSprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: nameTexture, transparent: true, depthWrite: false })
      );
      nameSprite.position.set(0, 6.2, 0);
      nameSprite.scale.set(7.4, 3.18, 1);
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
        presetId: preset.id,
        walkPhase: 0,
      };
    };

    // Helper to create 3D Building Facade Signboard Sprite
    const createBuildingSignboard = (titleText: string, subText: string, borderHex: string) => {
      const sCanvas = document.createElement('canvas');
      sCanvas.width = 512;
      sCanvas.height = 112;
      const sCtx = sCanvas.getContext('2d')!;
      sCtx.fillStyle = 'rgba(6, 78, 59, 0.96)';
      sCtx.strokeStyle = borderHex;
      sCtx.lineWidth = 6;
      sCtx.beginPath();
      sCtx.roundRect(8, 8, 496, 96, 16);
      sCtx.fill();
      sCtx.stroke();

      sCtx.fillStyle = '#ffffff';
      sCtx.font = '800 24px "Outfit", sans-serif';
      sCtx.textAlign = 'center';
      sCtx.fillText(titleText, 256, 48);

      sCtx.fillStyle = '#fde68a';
      sCtx.font = '700 18px "JetBrains Mono", monospace';
      sCtx.fillText(subText, 256, 80);

      const sTex = new THREE.CanvasTexture(sCanvas);
      sTex.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: sTex, transparent: true, depthWrite: false })
      );
      sprite.scale.set(16, 3.5, 1);
      return sprite;
    };

    // ========================================================================
    // 4A. TIANG BENDERA MERAH PUTIH & ROBLOX JUMP PADS DI LAPANGAN UPACARA MTsN 14
    // ========================================================================
    const ROBLOX_JUMP_PADS = [
      { mapX: 980, mapY: 620 },
      { mapX: 1420, mapY: 620 },
      { mapX: 980, mapY: 940 },
      { mapX: 1420, mapY: 940 },
    ];
    ROBLOX_JUMP_PADS.forEach((pad) => {
      const padGroup = new THREE.Group();
      padGroup.position.set(to3DX(pad.mapX), 0, to3DZ(pad.mapY));
      const padBase = new THREE.Mesh(
        new THREE.CylinderGeometry(2.3, 2.6, 0.35, 24),
        new THREE.MeshStandardMaterial({
          color: 0x0ea5e9,
          emissive: 0x0284c7,
          emissiveIntensity: 0.75,
          roughness: 0.2,
          metalness: 0.6,
        })
      );
      padBase.position.y = 0.18;
      padGroup.add(padBase);

      const padRing = new THREE.Mesh(
        new THREE.RingGeometry(2.5, 3.1, 24),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        })
      );
      padRing.rotation.x = -Math.PI / 2;
      padRing.position.y = 0.06;
      padGroup.add(padRing);
      scene.add(padGroup);
    });

    const flagpoleGroup = new THREE.Group();
    flagpoleGroup.position.set(to3DX(1200), 0, to3DZ(585));
    const flagpoleBase = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.9, 3.6),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 })
    );
    flagpoleBase.position.y = 0.45;
    flagpoleGroup.add(flagpoleBase);

    const poleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.2, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.6, roughness: 0.3 })
    );
    poleMesh.position.y = 8;
    flagpoleGroup.add(poleMesh);

    // Bendera Merah Putih
    const flagRed = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 1.1, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x991b1b, emissiveIntensity: 0.3 })
    );
    flagRed.position.set(1.95, 15.2, 0);
    flagpoleGroup.add(flagRed);

    const flagWhite = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 1.1, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    flagWhite.position.set(1.95, 14.1, 0);
    flagpoleGroup.add(flagWhite);
    scene.add(flagpoleGroup);

    // Monumen Dirgantara / Siluet Pesawat TNI AU Halim Perdanakusuma di Dekat Gerbang Jl. Elang
    const jetGroup = new THREE.Group();
    jetGroup.position.set(to3DX(940), 0, to3DZ(1165));
    const jetPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 2.2, 4.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    );
    jetPedestal.position.y = 2.25;
    jetGroup.add(jetPedestal);

    const jetBody = new THREE.Mesh(
      new THREE.ConeGeometry(0.9, 6.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.25 })
    );
    jetBody.rotation.x = Math.PI / 2 - 0.35;
    jetBody.position.y = 5.2;
    jetGroup.add(jetBody);

    const jetWings = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.18, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.3 })
    );
    jetWings.rotation.x = -0.35;
    jetWings.position.y = 5.0;
    jetGroup.add(jetWings);

    const jetSign = createBuildingSignboard(
      'MONUMEN DIRGANTARA HALIM',
      'KAWASAN LANUD HALIM PERDANAKUSUMA',
      '#38bdf8'
    );
    jetSign.scale.set(11, 2.4, 1);
    jetSign.position.set(0, 8.2, 0);
    jetGroup.add(jetSign);
    scene.add(jetGroup);

    // ========================================================================
    // 4B. 6 GEDUNG UTAMA KAMPUS MTs NEGERI 14 JAKARTA TIMUR (HALIM)
    // ========================================================================
    TEACHER_POSTS.forEach((post) => {
      const bx = to3DX(post.mapX);
      const bz = to3DZ(post.mapY);

      const bGroup = new THREE.Group();
      const bOffsetZ = post.mapY < 750 ? -14 : 14;
      bGroup.position.set(bx, 0, bz + bOffsetZ);

      const bWidth = post.index === 0 ? 34 : 28;
      const bHeight = post.index === 0 ? 14.5 : 11.5;
      const bDepth = 14;

      // Authentic Madrasah Negeri Emerald Green & Cream Facade
      const wallColor = post.index === 2 ? 0x065f46 : 0x0f5132;
      const buildingMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth, bHeight, bDepth),
        new THREE.MeshStandardMaterial({
          color: wallColor,
          roughness: 0.5,
          metalness: 0.2,
        })
      );
      buildingMesh.position.y = bHeight / 2;
      buildingMesh.castShadow = !isSoftwareGl;
      buildingMesh.receiveShadow = !isSoftwareGl;
      bGroup.add(buildingMesh);

      // Cream Horizontal Madrasah Balcony Band (Selasar Kelas)
      const creamBand = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth + 0.6, 1.4, bDepth + 0.6),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 })
      );
      creamBand.position.y = bHeight * 0.5;
      bGroup.add(creamBand);

      if (post.index === 2) {
        // MASJID AL-IKHLAS MTsN 14 HALIM: Authentic Golden-Green Mosque Dome (Kubah) & Minaret
        const domeMesh = new THREE.Mesh(
          new THREE.SphereGeometry(6.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x047857,
            emissiveIntensity: 0.4,
            metalness: 0.6,
            roughness: 0.25,
          })
        );
        domeMesh.position.y = bHeight;
        bGroup.add(domeMesh);

        const spireMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.35, 3.2, 8),
          new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 })
        );
        spireMesh.position.y = bHeight + 7.2;
        bGroup.add(spireMesh);
      } else {
        // Traditional Indonesian School Terracotta Pitched Roof (Atap Genteng Merah Bata)
        const roofTrim = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth + 1.6, 1.2, bDepth + 1.6),
          new THREE.MeshStandardMaterial({
            color: 0x9a3412,
            roughness: 0.6,
          })
        );
        roofTrim.position.y = bHeight + 0.6;
        bGroup.add(roofTrim);

        const roofUpper = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth - 4, 2.2, bDepth - 3),
          new THREE.MeshStandardMaterial({
            color: 0x7c2d12,
            roughness: 0.65,
          })
        );
        roofUpper.position.y = bHeight + 2.1;
        bGroup.add(roofUpper);
      }

      // Illuminated Classroom / Lab Windows Strip
      const winMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth - 4, 2.4, bDepth + 0.3),
        new THREE.MeshStandardMaterial({
          color: 0xbae6fd,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.45,
          roughness: 0.2,
        })
      );
      winMesh.position.y = bHeight * 0.74;
      bGroup.add(winMesh);

      // 3D Signboard Above Building
      const signSprite = createBuildingSignboard(
        post.buildingName,
        'KAMPUS MTsN 14 JAKARTA TIMUR · HALIM PK',
        '#fbbf24'
      );
      signSprite.position.set(0, bHeight + 5.6, 0);
      bGroup.add(signSprite);

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
    let localMapY = WORLD_HEIGHT / 2 + 30;
    let localJumpY = 0;
    let localJumpVy = 0;
    let localDashTimer = 0;
    let localDashCooldown = 0;
    let localFacingAngle = Math.PI;
    let localWalkPhase = 0;
    let lastNearbyTeacherIdx: number | null = null;
    let lastNearbyVersusId: string | null = null;
    let lastTeleportSeq = 0;
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

    let cameraTouchId: number | null = null;
    let lastTouchX = 0;
    let lastTouchY = 0;

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

    const handleTouchStartCanvas = (e: TouchEvent) => {
      if (cameraTouchId !== null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === joystickTouchIdRef.current) continue;
        cameraTouchId = t.identifier;
        lastTouchX = t.clientX;
        lastTouchY = t.clientY;
        break;
      }
    };

    const handleTouchMoveCanvas = (e: TouchEvent) => {
      if (cameraTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === cameraTouchId) {
          const dx = t.clientX - lastTouchX;
          const dy = t.clientY - lastTouchY;
          lastTouchX = t.clientX;
          lastTouchY = t.clientY;
          cameraYaw -= dx * 0.0075;
          cameraPitch = THREE.MathUtils.clamp(cameraPitch + dy * 0.0055, 0.16, 1.25);
          break;
        }
      }
    };

    const handleTouchEndCanvas = (e: TouchEvent) => {
      if (cameraTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === cameraTouchId) {
          cameraTouchId = null;
          break;
        }
      }
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
    renderer.domElement.addEventListener('touchstart', handleTouchStartCanvas, { passive: true });
    window.addEventListener('touchmove', handleTouchMoveCanvas, { passive: true });
    window.addEventListener('touchend', handleTouchEndCanvas, { passive: true });
    window.addEventListener('touchcancel', handleTouchEndCanvas, { passive: true });
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
        if (
          currentProps.teleportCommand &&
          currentProps.teleportCommand.seq !== lastTeleportSeq
        ) {
          lastTeleportSeq = currentProps.teleportCommand.seq;
          localMapX = THREE.MathUtils.clamp(
            currentProps.teleportCommand.x,
            70,
            WORLD_WIDTH - 70
          );
          localMapY = THREE.MathUtils.clamp(
            currentProps.teleportCommand.y,
            70,
            WORLD_HEIGHT - 70
          );
          localJumpY = 2.2;
          localJumpVy = 6;
          currentProps.onEmitLocalMove(
            Math.round(localMapX),
            Math.round(localMapY),
            0,
            0,
            Number(localFacingAngle.toFixed(3)),
            Number(localJumpY.toFixed(2))
          );
        }

        if (heldKeys.has('KeyQ')) cameraYaw += 1.8 * dt;
        if (heldKeys.has('KeyE')) cameraYaw -= 1.8 * dt;

        let forwardInput = -touchStickRef.current.y;
        let rightInput = touchStickRef.current.x;
        if (heldKeys.has('KeyW') || heldKeys.has('ArrowUp')) forwardInput += 1;
        if (heldKeys.has('KeyS') || heldKeys.has('ArrowDown')) forwardInput -= 1;
        if (heldKeys.has('KeyD') || heldKeys.has('ArrowRight')) rightInput += 1;
        if (heldKeys.has('KeyA') || heldKeys.has('ArrowLeft')) rightInput -= 1;

        let moveX = 0;
        let moveY = 0;
        const inputMag = Math.min(1, Math.hypot(forwardInput, rightInput));
        if (inputMag > 0.05) {
          const sinY = Math.sin(cameraYaw);
          const cosY = Math.cos(cameraYaw);
          const rawX = -sinY * forwardInput + cosY * rightInput;
          const rawZ = -cosY * forwardInput - sinY * rightInput;
          const len = Math.hypot(rawX, rawZ) || 1;
          moveX = (rawX / len) * inputMag;
          moveY = (rawZ / len) * inputMag;
        }

        localDashCooldown = Math.max(0, localDashCooldown - dt);
        localDashTimer = Math.max(0, localDashTimer - dt);

        if (justPressedKeys.has('Space') || mobileJumpQueuedRef.current) {
          mobileJumpQueuedRef.current = false;
          if (localJumpY <= 0.01) {
            localJumpVy = 17.5;
            soundEngine.playDash();
          }
          if (localDashCooldown <= 0) {
            localDashCooldown = 0.65;
            localDashTimer = 0.25;
          }
        }

        // Check Roblox-Style Open-World Jump Pads in Lapangan Upacara MTsN 14
        if (localJumpY <= 0.2) {
          for (const pad of ROBLOX_JUMP_PADS) {
            if (Math.hypot(localMapX - pad.mapX, localMapY - pad.mapY) <= 32) {
              localJumpVy = 29.5;
              localJumpY = 0.35;
              soundEngine.playDash();
              break;
            }
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
          wsEmitCooldown = 0.05; // 20Hz high-frequency real-time movement sync
          currentProps.onEmitLocalMove(
            Math.round(localMapX),
            Math.round(localMapY),
            Math.round(vx),
            Math.round(vy),
            Number(localFacingAngle.toFixed(3)),
            Number(localJumpY.toFixed(2)),
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
      // SYNC & ANIMATE ALL 3D HUMANOID STUDENT CHARACTERS + ROBLOX SPEECH BUBBLES
      // ======================================================================
      const nowMs = Date.now();
      const activeIds = new Set<string>();
      const localRec = currentProps.players.find((p) => p.id === currentProps.localPlayerId);
      const localMp = localRec?.missionPoints ?? 100;
      const localScore = localRec?.score ?? 0;

      if (currentProps.joinedRoom) {
        activeIds.add(currentProps.localPlayerId);
        const preset = getPresetById(currentProps.localPlayerPreset);
        let localRig = playerRigs.get(currentProps.localPlayerId);
        if (localRig && localRig.presetId !== preset.id) {
          scene.remove(localRig.group);
          localRig.nameTexture.dispose();
          playerRigs.delete(currentProps.localPlayerId);
          localRig = undefined;
        }
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

        const localBubbleSource = currentProps.localChatBubble || {
          text: localRec?.lastChatText || '',
          timestamp: localRec?.lastChatTime || 0,
        };
        const activeLocalChat =
          localBubbleSource.text && nowMs - localBubbleSource.timestamp < 9000
            ? localBubbleSource.text
            : '';

        const sig = `${currentProps.localPlayerName}|${currentProps.localPlayerClass}|${localMp}|${localScore}|${activeLocalChat}`;
        if (localRig.lastSignature !== sig) {
          localRig.lastSignature = sig;
          drawOverheadTag(
            localRig.nameCanvas,
            currentProps.localPlayerName,
            `${currentProps.localPlayerClass} · ${localMp} MP · $${localScore}`,
            '#38bdf8',
            false,
            activeLocalChat
          );
          localRig.nameTexture.needsUpdate = true;
        }
      }

      for (const rp of currentProps.players) {
        if (rp.id === currentProps.localPlayerId) continue;
        activeIds.add(rp.id);

        const preset = getPresetById(rp.characterPreset);
        let rig = playerRigs.get(rp.id);
        if (rig && rig.presetId !== preset.id) {
          scene.remove(rig.group);
          rig.nameTexture.dispose();
          playerRigs.delete(rp.id);
          rig = undefined;
        }

        const isOnlineHuman = !rp.isRoamingPeer;
        const badgeColor = isOnlineHuman ? '#10b981' : '#fbbf24';
        const subLabel = isOnlineHuman
          ? `● ONLINE · ${rp.studentClass} · [V] AJAK DUEL`
          : `${rp.studentClass} · [V] LATIHAN DUEL`;

        if (!rig) {
          rig = buildHumanoidCharacter(preset, rp.name, subLabel, badgeColor, false);
          rig.group.position.set(to3DX(rp.x), rp.jumpY || 0, to3DZ(rp.y));
          if (typeof rp.facingAngle === 'number') {
            rig.group.rotation.y = rp.facingAngle;
          }
          scene.add(rig.group);
          playerRigs.set(rp.id, rig);
        }

        // Dead-reckoning prediction for silky-smooth real-time movement between packets
        const ageSec = rp.lastUpdated
          ? Math.min(0.18, Math.max(0, (nowMs - rp.lastUpdated) / 1000))
          : 0;
        const predictedMapX = THREE.MathUtils.clamp(
          rp.x + (rp.vx || 0) * ageSec * 0.45,
          60,
          WORLD_WIDTH - 60
        );
        const predictedMapY = THREE.MathUtils.clamp(
          rp.y + (rp.vy || 0) * ageSec * 0.45,
          60,
          WORLD_HEIGHT - 60
        );

        const tx = to3DX(predictedMapX);
        const tz = to3DZ(predictedMapY);
        const ty = typeof rp.jumpY === 'number' ? Math.max(0, rp.jumpY) : 0;

        const dx = tx - rig.group.position.x;
        const dz = tz - rig.group.position.z;
        const distMoved = Math.hypot(dx, dz);

        if (distMoved > 38) {
          // Instant snap if player teleported across the map
          rig.group.position.x = tx;
          rig.group.position.z = tz;
          rig.group.position.y = ty;
        } else {
          rig.group.position.x = THREE.MathUtils.damp(rig.group.position.x, tx, 14, dt);
          rig.group.position.z = THREE.MathUtils.damp(rig.group.position.z, tz, 14, dt);
          rig.group.position.y = THREE.MathUtils.damp(rig.group.position.y, ty, 16, dt);
        }

        // Accurate 3D facing rotation (uses exact facingAngle sent by the remote student!)
        const remoteSpeed = Math.hypot(rp.vx || 0, rp.vy || 0);
        const desiredRot =
          typeof rp.facingAngle === 'number'
            ? rp.facingAngle
            : distMoved > 0.03
            ? Math.atan2(dx, dz)
            : rig.group.rotation.y;

        let rotDiff = desiredRot - rig.group.rotation.y;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        rig.group.rotation.y += rotDiff * Math.min(1, dt * 14);

        // Accurate 3D walking/running/jumping limb animation matching remote player's motion
        if (ty > 0.15) {
          rig.leftLegPivot.rotation.x = 0.78;
          rig.rightLegPivot.rotation.x = -0.78;
          rig.leftArmPivot.rotation.x = -0.7;
          rig.rightArmPivot.rotation.x = 0.7;
        } else if (remoteSpeed > 18 || distMoved > 0.035) {
          const animFreq = remoteSpeed > 480 ? 15 : 10.5;
          rig.walkPhase += dt * animFreq;
          const sw = Math.sin(rig.walkPhase) * 0.62;
          rig.leftLegPivot.rotation.x = sw;
          rig.rightLegPivot.rotation.x = -sw;
          rig.leftArmPivot.rotation.x = -sw * 0.85;
          rig.rightArmPivot.rotation.x = sw * 0.85;
        } else {
          rig.leftLegPivot.rotation.x = THREE.MathUtils.damp(rig.leftLegPivot.rotation.x, 0, 10, dt);
          rig.rightLegPivot.rotation.x = THREE.MathUtils.damp(
            rig.rightLegPivot.rotation.x,
            0,
            10,
            dt
          );
          rig.leftArmPivot.rotation.x = THREE.MathUtils.damp(rig.leftArmPivot.rotation.x, 0, 10, dt);
          rig.rightArmPivot.rotation.x = THREE.MathUtils.damp(
            rig.rightArmPivot.rotation.x,
            0,
            10,
            dt
          );
        }

        const activePeerChat =
          rp.lastChatText && rp.lastChatTime && nowMs - rp.lastChatTime < 9000
            ? rp.lastChatText
            : '';

        const sig = `${rp.name}|${rp.studentClass}|${rp.score}|${isOnlineHuman}|${activePeerChat}`;
        if (rig.lastSignature !== sig) {
          rig.lastSignature = sig;
          drawOverheadTag(rig.nameCanvas, rp.name, subLabel, badgeColor, false, activePeerChat);
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

          // 3. Cyan/Emerald Blips for Real Online Classmates & Red Blips for NPC Students
          for (const rp of currentProps.players) {
            if (rp.id === currentProps.localPlayerId) continue;
            const px = cx + (rp.x - localMapX) * scaleMap;
            const py = cy + (rp.y - localMapY) * scaleMap;
            const isOnlineHuman = !rp.isRoamingPeer;
            rCtx.fillStyle = isOnlineHuman ? '#38bdf8' : '#f43f5e';
            rCtx.beginPath();
            rCtx.arc(px, py, isOnlineHuman ? 6.5 : 4.5, 0, Math.PI * 2);
            rCtx.fill();
            if (isOnlineHuman) {
              rCtx.strokeStyle = '#ffffff';
              rCtx.lineWidth = 1.5;
              rCtx.stroke();
            }
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
      renderer.domElement.removeEventListener('touchstart', handleTouchStartCanvas);
      window.removeEventListener('touchmove', handleTouchMoveCanvas);
      window.removeEventListener('touchend', handleTouchEndCanvas);
      window.removeEventListener('touchcancel', handleTouchEndCanvas);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      cityTexture.dispose();
      shadowTexture.dispose();
      renderer.dispose();
    };
  }, []);

  const MAX_JOYSTICK_RADIUS = 38;

  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    if (!touch) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    joystickTouchIdRef.current = touch.identifier;
    joystickCenterRef.current = { x: cx, y: cy };

    const dx = touch.clientX - cx;
    const dy = touch.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, MAX_JOYSTICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;
    setJoystickKnob({ x: kx, y: ky });
    touchStickRef.current = {
      x: kx / MAX_JOYSTICK_RADIUS,
      y: ky / MAX_JOYSTICK_RADIUS,
    };
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === joystickTouchIdRef.current) {
        const dx = t.clientX - joystickCenterRef.current.x;
        const dy = t.clientY - joystickCenterRef.current.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, MAX_JOYSTICK_RADIUS);
        const angle = Math.atan2(dy, dx);
        const kx = Math.cos(angle) * clampedDist;
        const ky = Math.sin(angle) * clampedDist;
        setJoystickKnob({ x: kx, y: ky });
        touchStickRef.current = {
          x: kx / MAX_JOYSTICK_RADIUS,
          y: ky / MAX_JOYSTICK_RADIUS,
        };
        break;
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setJoystickKnob({ x: 0, y: 0 });
        touchStickRef.current = { x: 0, y: 0 };
        break;
      }
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950 touch-none">
      <div ref={mountRef} className="w-full h-full touch-none" />

      {/* Adaptive GTA San Andreas Circular Radar Mini-Map:
          - Handphone (<640px): Compact 84x84px in top-right below status bar (keeps bottom-left clear for Virtual Joystick!)
          - Desktop/Tablet (>=640px): 148x148px in bottom-left */}
      {joinedRoom && (
        <div className="fixed top-[60px] right-2.5 sm:top-auto sm:right-auto sm:bottom-5 sm:left-5 z-20 pointer-events-none flex flex-col items-center gap-1">
          <canvas
            ref={radarCanvasRef}
            width={148}
            height={148}
            className="block w-[82px] h-[82px] sm:w-[148px] sm:h-[148px] rounded-full shadow-2xl"
          />
          <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-0.5 rounded border border-slate-800">
            G: Pos Guru · ■: Barang · ●: Siswa
          </span>
        </div>
      )}

      {/* MOBILE / HANDPHONE VIRTUAL ANALOG JOYSTICK & JUMP/SPRINT PAD (Visible on Handphone & Tablet <1024px) */}
      {joinedRoom && (
        <>
          {/* Left Thumb Virtual Analog Joystick */}
          <div
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            onTouchCancel={handleJoystickEnd}
            className="fixed bottom-16 left-4 z-20 lg:hidden w-28 h-28 rounded-full bg-slate-900/80 border-2 border-slate-600/90 shadow-2xl flex items-center justify-center touch-none select-none"
            aria-label="Joystick Virtual Jalan 3D"
          >
            <div className="w-20 h-20 rounded-full border border-slate-700/70 flex items-center justify-center pointer-events-none">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                JALAN
              </span>
            </div>
            <div
              className="absolute w-12 h-12 rounded-full bg-emerald-500/90 border-2 border-white shadow-lg pointer-events-none flex items-center justify-center"
              style={{
                transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-white/90" />
            </div>
          </div>

          {/* Right Thumb Jump & Dash Action Button */}
          <div className="fixed bottom-20 right-4 z-20 lg:hidden flex flex-col items-center gap-2">
            <button
              type="button"
              onTouchStart={(e) => {
                e.stopPropagation();
                mobileJumpQueuedRef.current = true;
              }}
              onClick={() => {
                mobileJumpQueuedRef.current = true;
              }}
              className="w-16 h-16 rounded-full bg-sky-600/90 active:bg-sky-400 border-2 border-sky-300 shadow-2xl flex flex-col items-center justify-center text-white font-extrabold text-[10px] font-mono leading-tight touch-none select-none"
            >
              <span>LOMPAT</span>
              <span className="text-[9px] text-sky-200">DASH</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
