import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  InformaticsMaterial,
  InformaticsQuestion,
  OptionKey,
} from '../data/informaticsData';
import { soundEngine } from '../utils/soundEngine';
import { useDeviceViewport } from '../utils/useDeviceViewport';

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
    buildingName: 'GEDUNG UTAMA MTs NEGERI 14 JAKARTA TIMUR',
    mapX: 1200,
    mapY: 200,
    colorHex: 0xf59e0b,
  },
  {
    index: 1,
    title: 'Pak Azhary · Lab Komputer & Informatika',
    buildingName: 'LAB KOMPUTER & MULTIMEDIA MTsN 14',
    mapX: 420,
    mapY: 200,
    colorHex: 0x0ea5e9,
  },
  {
    index: 2,
    title: 'Pak Azhary · Masjid Al - Huda MTsN 14',
    buildingName: 'MASJID AL - HUDA MTsN 14 HALIM',
    mapX: 1980,
    mapY: 200,
    colorHex: 0x10b981,
  },
  {
    index: 3,
    title: 'Pak Azhary · Gedung Kelas 7, 8, 9 & Perpus',
    buildingName: 'GEDUNG KELAS 7-8-9 & PERPUSTAKAAN',
    mapX: 420,
    mapY: 1300,
    colorHex: 0xf43f5e,
  },
  {
    index: 4,
    title: 'Pak Azhary · Aula Serbaguna & Ruang UKS',
    buildingName: 'AULA SERBAGUNA & UKS MTsN 14 HALIM',
    mapX: 1980,
    mapY: 1300,
    colorHex: 0xa855f7,
  },
  {
    index: 5,
    title: 'Pak Azhary · Gerbang Jl. Elang Halim & Kantin',
    buildingName: 'GERBANG JL. ELANG KOMP. RAJAWALI HALIM',
    mapX: 1200,
    mapY: 1390,
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
  onNearbyBuildingEntranceChange?: (post: TeacherPostLocation | null) => void;
  onEnterBuildingInterior?: (post: TeacherPostLocation) => void;
  onItemPickedUpToast: (itemName: string, mpGain: number) => void;
  onLocalHudSync: (state: { x: number; y: number; hp: number }) => void;
}

// Create Procedural MTs Negeri 14 Jakarta Timur (Kampus Halim Perdanakusuma) Ground & Green Sports Court Texture
function createCityDistrictTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const cw = 2048;
  const ch = 1280;
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d')!;

  // Map to Canvas projection helpers (1:1 precision!)
  const mxToPx = (mx: number) => (mx / 2400) * cw;
  const myToPy = (my: number) => (my / 1500) * ch;
  const mwToPw = (mw: number) => (mw / 2400) * cw;
  const mhToPh = (mh: number) => (mh / 1500) * ch;

  // 1. Lush Madrasah green courtyard grounds
  ctx.fillStyle = '#155e34';
  ctx.fillRect(0, 0, cw, ch);

  // 2. Subtle paving & grass tile grid lines
  ctx.strokeStyle = 'rgba(134, 239, 172, 0.1)';
  ctx.lineWidth = 1.5;
  for (let mx = 0; mx <= 2400; mx += 40) {
    ctx.beginPath();
    ctx.moveTo(mxToPx(mx), 0);
    ctx.lineTo(mxToPx(mx), ch);
    ctx.stroke();
  }
  for (let my = 0; my <= 1500; my += 40) {
    ctx.beginPath();
    ctx.moveTo(0, myToPy(my));
    ctx.lineTo(cw, myToPy(my));
    ctx.stroke();
  }

  // 3. Outer Ring Asphalt Roads (Jalan Aspal Outer Ring Kampus)
  const drawAsphaltH = (myStart: number, myH: number) => {
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, myToPy(myStart - 4), cw, mhToPh(myH + 8));
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, myToPy(myStart), cw, mhToPh(myH));
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.setLineDash([24, 16]);
    ctx.beginPath();
    ctx.moveTo(0, myToPy(myStart + myH / 2));
    ctx.lineTo(cw, myToPy(myStart + myH / 2));
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawAsphaltV = (mxStart: number, mxW: number) => {
    ctx.fillStyle = '#facc15';
    ctx.fillRect(mxToPx(mxStart - 4), 0, mwToPw(mxW + 8), ch);
    ctx.fillStyle = '#334155';
    ctx.fillRect(mxToPx(mxStart), 0, mwToPw(mxW), ch);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.setLineDash([24, 16]);
    ctx.beginPath();
    ctx.moveTo(mxToPx(mxStart + mxW / 2), 0);
    ctx.lineTo(mxToPx(mxStart + mxW / 2), ch);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  drawAsphaltH(0, 80);
  drawAsphaltH(1420, 80);
  drawAsphaltV(0, 80);
  drawAsphaltV(2320, 80);

  // 4. Inner Paved Walkway Corridors (Jalan Paving & Selasar Kampus)
  const drawWalkwayH = (myStart: number, myH: number) => {
    ctx.fillStyle = '#166534';
    ctx.fillRect(mxToPx(80), myToPy(myStart - 6), mwToPw(2240), mhToPh(myH + 12));
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(mxToPx(80), myToPy(myStart), mwToPw(2240), mhToPh(myH));
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    const pY = myToPy(myStart);
    const pH = mhToPh(myH);
    for (let px = mxToPx(80); px <= mxToPx(2320); px += 24) {
      ctx.beginPath();
      ctx.moveTo(px, pY);
      ctx.lineTo(px, pY + pH);
      ctx.stroke();
    }
  };

  const drawWalkwayV = (mxStart: number, mxW: number, myFrom: number, myTo: number) => {
    ctx.fillStyle = '#166534';
    ctx.fillRect(mxToPx(mxStart - 6), myToPy(myFrom), mwToPw(mxW + 12), mhToPh(myTo - myFrom));
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(mxToPx(mxStart), myToPy(myFrom), mwToPw(mxW), mhToPh(myTo - myFrom));
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    const pX = mxToPx(mxStart);
    const pW = mwToPw(mxW);
    for (let py = myToPy(myFrom); py <= myToPy(myTo); py += 24) {
      ctx.beginPath();
      ctx.moveTo(pX, py);
      ctx.lineTo(pX + pW, py);
      ctx.stroke();
    }
  };

  drawWalkwayH(330, 70);  // North Corridor
  drawWalkwayH(1110, 70); // South Corridor
  drawWalkwayV(630, 70, 330, 1180);  // West Cross Corridor
  drawWalkwayV(1700, 70, 330, 1180); // East Cross Corridor
  drawWalkwayV(1130, 140, 1110, 1500); // Grand Entrance Avenue

  // 5. Dedicated Building Plazas (Landasan Paving Presisi di Bawah Setiap Gedung)
  const drawBuildingPlaza = (cx: number, cy: number, w: number, h: number) => {
    ctx.fillStyle = '#14532d';
    ctx.fillRect(
      mxToPx(cx - w / 2 - 8),
      myToPy(cy - h / 2 - 8),
      mwToPw(w + 16),
      mhToPh(h + 16)
    );
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(
      mxToPx(cx - w / 2),
      myToPy(cy - h / 2),
      mwToPw(w),
      mhToPh(h)
    );
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      mxToPx(cx - w / 2),
      myToPy(cy - h / 2),
      mwToPw(w),
      mhToPh(h)
    );
  };

  // Gedung Utama Plaza (1200, 200)
  drawBuildingPlaza(1200, 200, 520, 260);
  // Lab Komputer Plaza (420, 200)
  drawBuildingPlaza(420, 200, 380, 260);
  // Masjid Al - Huda Plaza (1980, 200)
  drawBuildingPlaza(1980, 200, 420, 260);
  // Gedung Kelas Plaza (420, 1300)
  drawBuildingPlaza(420, 1300, 380, 240);
  // Aula Serbaguna Plaza (1980, 1300)
  drawBuildingPlaza(1980, 1300, 380, 240);
  // Gerbang Utama Plaza (1200, 1390)
  drawBuildingPlaza(1200, 1390, 420, 180);

  // 6. LAPANGAN HIJAU MULTIFUNGSI (FUTSAL, BASKET & UPACARA) MTs NEGERI 14 JAKARTA TIMUR
  const cMx = 720;
  const cMy = 470;
  const cMw = 960;
  const cMh = 560;

  const cPx = mxToPx(cMx);
  const cPy = myToPy(cMy);
  const cPw = mwToPw(cMw);
  const cPh = mhToPh(cMh);

  // Dark green concrete apron around court
  ctx.fillStyle = '#14532d';
  ctx.beginPath();
  ctx.roundRect(cPx - 20, cPy - 20, cPw + 40, cPh + 40, 18);
  ctx.fill();

  // Bright Leaf-Green Multifunction Court Surface
  const courtGrad = ctx.createLinearGradient(cPx, cPy, cPx + cPw, cPy + cPh);
  courtGrad.addColorStop(0, '#22c55e');
  courtGrad.addColorStop(0.5, '#16a34a');
  courtGrad.addColorStop(1, '#15803d');
  ctx.fillStyle = courtGrad;
  ctx.fillRect(cPx, cPy, cPw, cPh);

  // Concrete Slab Joint Grid on Court
  ctx.strokeStyle = 'rgba(20, 83, 45, 0.25)';
  ctx.lineWidth = 2;
  for (let px = cPx; px <= cPx + cPw; px += 48) {
    ctx.beginPath();
    ctx.moveTo(px, cPy);
    ctx.lineTo(px, cPy + cPh);
    ctx.stroke();
  }
  for (let py = cPy; py <= cPy + cPh; py += 48) {
    ctx.beginPath();
    ctx.moveTo(cPx, py);
    ctx.lineTo(cPx + cPw, py);
    ctx.stroke();
  }

  // Basketball & Futsal Penalty Arcs in Orange
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cPx + 40, cPy + cPh / 2, 110, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cPx + cPw - 40, cPy + cPh / 2, 110, Math.PI / 2, -Math.PI / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cPx + cPw / 2, cPy + cPh / 2, 95, 0, Math.PI * 2);
  ctx.stroke();

  // Bright Yellow Court Boundary & Lines
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 7;
  ctx.strokeRect(cPx + 16, cPy + 16, cPw - 32, cPh - 32);

  // Yellow Center Line
  ctx.beginPath();
  ctx.moveTo(cPx + cPw / 2, cPy + 16);
  ctx.lineTo(cPx + cPw / 2, cPy + cPh - 16);
  ctx.stroke();

  // Yellow Center Circle
  ctx.beginPath();
  ctx.arc(cPx + cPw / 2, cPy + cPh / 2, 64, 0, Math.PI * 2);
  ctx.stroke();

  // Left & Right Futsal / Basketball Key Boxes
  ctx.strokeRect(cPx + 16, cPy + cPh / 2 - 80, 90, 160);
  ctx.strokeRect(cPx + cPw - 106, cPy + cPh / 2 - 80, 90, 160);

  // School Name Printed on Court Border
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = '800 24px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MADRASAH TSANAWIYAH NEGERI 14 JAKARTA TIMUR', cw / 2, cPy + 48);
  ctx.fillStyle = '#fef08a';
  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.fillText('LAPANGAN UTAMA & MASJID AL - HUDA · KOMP. RAJAWALI HALIM PK', cw / 2, cPy + cPh - 22);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

// Create Procedural Sky Constellation & Clouds Backdrop matching the attached MTsN 14 reference image
function createHalimConstellationSkyTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Royal blue to bright cerulean sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 256);
  skyGrad.addColorStop(0, '#034ea2');
  skyGrad.addColorStop(0.55, '#0284c7');
  skyGrad.addColorStop(1, '#7dd3fc');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 256);

  // Sunburst on the upper-left sky (matching photo)
  const sunGrad = ctx.createRadialGradient(230, 58, 4, 230, 58, 95);
  sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  sunGrad.addColorStop(0.25, 'rgba(254, 249, 195, 0.85)');
  sunGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(120, 0, 220, 160);

  // Fluffy white cumulus clouds along the bottom horizon
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  for (let x = 20; x < 1024; x += 68) {
    const r = 28 + ((x * 13) % 24);
    ctx.beginPath();
    ctx.arc(x, 238, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Constellation network lines & stars in the sky (Book, Toga, Globe, Laptop, Lightbulb)
  ctx.strokeStyle = 'rgba(224, 242, 254, 0.65)';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 1.8;

  const drawConstellationNode = (nx: number, ny: number) => {
    ctx.beginPath();
    ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
    ctx.fill();
  };

  // 1. Open Book Constellation (Left)
  const bookPts = [
    [90, 130],
    [135, 115],
    [135, 165],
    [90, 180],
    [90, 130],
    [135, 115],
    [180, 130],
    [180, 180],
    [135, 165],
  ];
  ctx.beginPath();
  bookPts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.stroke();
  bookPts.forEach(([px, py]) => drawConstellationNode(px, py));

  // 2. Graduation Cap / Toga Constellation
  const capPts = [
    [310, 95],
    [365, 72],
    [420, 95],
    [365, 118],
    [310, 95],
  ];
  ctx.beginPath();
  capPts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.stroke();
  capPts.forEach(([px, py]) => drawConstellationNode(px, py));

  // 3. Globe Constellation (Center)
  ctx.beginPath();
  ctx.arc(512, 112, 38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(512, 112, 18, 38, 0, 0, Math.PI * 2);
  ctx.stroke();
  drawConstellationNode(512, 74);
  drawConstellationNode(512, 150);

  // 4. Laptop & Lightbulb Constellation (Right)
  const laptopPts = [
    [840, 82],
    [910, 82],
    [910, 128],
    [840, 128],
    [840, 82],
  ];
  ctx.beginPath();
  laptopPts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.stroke();
  laptopPts.forEach(([px, py]) => drawConstellationNode(px, py));

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

// Create Authentic MTsN 14 Green Wall Emblem & Typography Plaque matching the Main Building photo
function createMtsn14WallCrestTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Match the light pastel green facade wall (#7ccf6a)
  ctx.fillStyle = '#7ccf6a';
  ctx.fillRect(0, 0, 512, 160);

  // Subtle dark green top border
  ctx.fillStyle = '#14532d';
  ctx.fillRect(0, 0, 512, 10);

  // Kemenag Shield Emblem in the center top
  ctx.fillStyle = '#15803d';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(234, 18, 44, 42, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fde047';
  ctx.font = '800 18px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', 256, 45);

  // Authentic Dark Green Wall Typography from the photo
  ctx.fillStyle = '#14532d';
  ctx.font = '800 17px "Outfit", sans-serif';
  ctx.fillText('MADRASAH TSANAWIYAH NEGERI 14 JAKARTA TIMUR', 256, 82);

  ctx.font = '900 32px "Outfit", sans-serif';
  ctx.fillText('MTSN 14', 256, 118);

  ctx.font = '700 14px "JetBrains Mono", monospace';
  ctx.fillText('JL. ELANG KOMP. RAJAWALI · JAKARTA TIMUR', 256, 142);

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
  onNearbyBuildingEntranceChange,
  onEnterBuildingInterior,
  onItemPickedUpToast,
  onLocalHudSync,
}) => {
  const vp = useDeviceViewport();
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
    onNearbyBuildingEntranceChange,
    onEnterBuildingInterior,
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
      onNearbyBuildingEntranceChange,
      onEnterBuildingInterior,
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
    onNearbyBuildingEntranceChange,
    onEnterBuildingInterior,
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
    const initW = container.clientWidth || window.innerWidth;
    const initH = container.clientHeight || window.innerHeight;
    const initAspect = initW / Math.max(1, initH);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(initW, initH);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Bright Daytime Cerulean Blue Sky Atmosphere matching MTsN 14 Halim Reference Photo
    const horizonColor = new THREE.Color(0x0284c7);
    scene.background = horizonColor;
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.0022);

    // 2. Mandatory Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      initAspect < 0.75 ? 66 : initAspect < 1.0 ? 60 : 54,
      initAspect,
      0.5,
      700
    );
    camera.position.set(0, 18, 32);

    // 3. Bright Daytime Sunlight Key + Cool Sky Hemisphere Lighting
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x15803d, 1.15);
    hemiLight.position.set(0, 80, 0);
    scene.add(hemiLight);

    const sunKeyLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
    sunKeyLight.position.set(-65, 105, 55);
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

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.65);
    rimLight.position.set(80, 50, -60);
    scene.add(rimLight);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const cityTexture = createCityDistrictTexture(maxAnisotropy);
    const shadowTexture = createContactShadowTexture();
    const skyConstellationTexture = createHalimConstellationSkyTexture(maxAnisotropy);
    const wallCrestTexture = createMtsn14WallCrestTexture(maxAnisotropy);

    // ========================================================================
    // 4. KAMPUS MTs NEGERI 14 JAKARTA TIMUR GROUND, SKY BACKDROP & BUILDINGS
    // ========================================================================
    const outerTerrain = new THREE.Mesh(
      new THREE.PlaneGeometry(700, 700),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.92, metalness: 0.05 })
    );
    outerTerrain.rotation.x = -Math.PI / 2;
    outerTerrain.position.y = -0.06;
    scene.add(outerTerrain);

    const cityGround = new THREE.Mesh(
      new THREE.PlaneGeometry(240, 150),
      new THREE.MeshStandardMaterial({
        map: cityTexture,
        roughness: 0.72,
        metalness: 0.08,
      })
    );
    cityGround.rotation.x = -Math.PI / 2;
    cityGround.receiveShadow = !isSoftwareGl;
    scene.add(cityGround);

    // Panoramic Constellation & Cumulus Clouds Sky Backdrop behind the Campus (Matching Reference Photo)
    const skyBackdrop = new THREE.Mesh(
      new THREE.CylinderGeometry(195, 195, 76, 40, 1, true, Math.PI * 0.65, Math.PI * 0.7),
      new THREE.MeshBasicMaterial({
        map: skyConstellationTexture,
        side: THREE.BackSide,
        fog: false,
      })
    );
    skyBackdrop.position.set(0, 34, 0);
    scene.add(skyBackdrop);

    // 3D Commercial Airliner Plane soaring over MTsN 14 Halim Perdanakusuma with White Contrail
    const halimAirlinerGroup = new THREE.Group();
    const fuselage = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.95, 8.2, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.3 })
    );
    fuselage.rotation.z = -Math.PI / 2;
    halimAirlinerGroup.add(fuselage);

    const airlinerWings = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.16, 10.4),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.4 })
    );
    airlinerWings.position.set(0.2, -0.1, 0);
    halimAirlinerGroup.add(airlinerWings);

    const tailFin = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.5, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35 })
    );
    tailFin.position.set(-4.1, 1.2, 0);
    halimAirlinerGroup.add(tailFin);

    const contrailMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 1.35, 36, 10),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      })
    );
    contrailMesh.rotation.z = Math.PI / 2;
    contrailMesh.position.set(-23, -0.1, 0);
    halimAirlinerGroup.add(contrailMesh);

    halimAirlinerGroup.position.set(18, 42, -55);
    halimAirlinerGroup.rotation.z = 0.18;
    halimAirlinerGroup.rotation.y = 0.22;
    scene.add(halimAirlinerGroup);

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

      // 1. Contact Shadow Disc + Glowing 3D Player Ring flush at y = 0.03..0.05
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

      if (!isTeacherNpc) {
        const playerRing = new THREE.Mesh(
          new THREE.RingGeometry(1.45, 1.85, 28),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(badgeColor),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
          })
        );
        playerRing.rotation.x = -Math.PI / 2;
        playerRing.position.y = 0.05;
        root.add(playerRing);
      }

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
      { mapX: 760, mapY: 510 },
      { mapX: 1640, mapY: 510 },
      { mapX: 760, mapY: 990 },
      { mapX: 1640, mapY: 990 },
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
    flagpoleGroup.position.set(to3DX(1200), 0, to3DZ(420));
    const flagpoleBase = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.7, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 })
    );
    flagpoleBase.position.y = 0.35;
    flagpoleGroup.add(flagpoleBase);

    const poleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.18, 18.5, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.4, roughness: 0.25 })
    );
    poleMesh.position.y = 9.25;
    flagpoleGroup.add(poleMesh);

    // Bendera Merah Putih
    const flagRed = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 1.1, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x991b1b, emissiveIntensity: 0.25 })
    );
    flagRed.position.set(1.95, 17.8, 0);
    flagpoleGroup.add(flagRed);

    const flagWhite = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 1.1, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    flagWhite.position.set(1.95, 16.7, 0);
    flagpoleGroup.add(flagWhite);
    scene.add(flagpoleGroup);

    // Monumen Dirgantara / Siluet Pesawat TNI AU Halim Perdanakusuma di Dekat Gerbang Jl. Elang
    const jetGroup = new THREE.Group();
    jetGroup.position.set(to3DX(980), 0, to3DZ(1320));
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
    // 4B. 6 GEDUNG UTAMA KAMPUS MTs NEGERI 14 JAKARTA TIMUR & MASJID AL - HUDA
    // Sesuai Gambar Acuan: Dinding Hijau Muda (#7ccf6a), Lis/Pilar Hijau Tua (#14532d),
    // Atap Genteng Merah Bata (#c2410c), serta Masjid Al - Huda dengan 2 Kubah Hijau Muda,
    // Atap Limas Tumpang, dan Menara Masjid Kotak Hijau Muda!
    // ========================================================================
    TEACHER_POSTS.forEach((post) => {
      const bx = to3DX(post.mapX);
      const bz = to3DZ(post.mapY);

      const bGroup = new THREE.Group();
      const bOffsetZ = post.mapY < 750 ? -14 : 14;
      bGroup.position.set(bx, 0, bz + bOffsetZ);

      const bWidth = post.index === 0 ? 40 : 28;
      const bHeight = post.index === 0 ? 13.5 : 11.2;
      const bDepth = 14.5;

      // Authentic MTsN 14 Light Pastel/Lime Green Facade (#7ccf6a) with Dark Forest Green Trim (#14532d)
      const lightGreenMat = new THREE.MeshStandardMaterial({
        color: 0x7ccf6a,
        roughness: 0.52,
        metalness: 0.08,
      });
      const darkGreenTrimMat = new THREE.MeshStandardMaterial({
        color: 0x14532d,
        roughness: 0.55,
        metalness: 0.1,
      });
      const terracottaRoofMat = new THREE.MeshStandardMaterial({
        color: 0xc2410c,
        roughness: 0.58,
        metalness: 0.08,
      });

      const buildingMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth, bHeight, bDepth),
        lightGreenMat
      );
      buildingMesh.position.y = bHeight / 2;
      buildingMesh.castShadow = !isSoftwareGl;
      buildingMesh.receiveShadow = !isSoftwareGl;
      bGroup.add(buildingMesh);

      // Dark Green Base Plinth & Balcony Fascia Band (Khas Gedung MTsN 14 pada foto)
      const plinthBand = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth + 0.5, 1.1, bDepth + 0.5),
        darkGreenTrimMat
      );
      plinthBand.position.y = 0.55;
      bGroup.add(plinthBand);

      const midBalconyBand = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth + 0.7, 1.35, bDepth + 0.7),
        lightGreenMat
      );
      midBalconyBand.position.y = bHeight * 0.52;
      bGroup.add(midBalconyBand);

      // Vertical Dark-Green Pillars along the Front Facade
      const pillarCount = post.index === 0 ? 5 : 4;
      for (let p = 0; p < pillarCount; p++) {
        const px = -bWidth / 2 + 2.2 + (p * (bWidth - 4.4)) / Math.max(1, pillarCount - 1);
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, bHeight, bDepth + 0.45),
          darkGreenTrimMat
        );
        pillar.position.set(px, bHeight / 2, 0);
        bGroup.add(pillar);
      }

      if (post.index === 0) {
        // GEDUNG UTAMA MTsN 14 JAKARTA TIMUR: Double Brown Doors + Kemenag Wall Emblem & Typography Plaque
        const frontZ = bDepth / 2 + 0.22;
        const doorMesh = new THREE.Mesh(
          new THREE.BoxGeometry(3.4, 4.2, 0.2),
          new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 })
        );
        doorMesh.position.set(0, 2.3, frontZ);
        bGroup.add(doorMesh);

        const wallPlaque = new THREE.Mesh(
          new THREE.PlaneGeometry(14.5, 4.5),
          new THREE.MeshBasicMaterial({ map: wallCrestTexture })
        );
        wallPlaque.position.set(0, bHeight * 0.54, frontZ + 0.16);
        bGroup.add(wallPlaque);
      }

      if (post.index === 2) {
        // ====================================================================
        // MASJID AL - HUDA MTsN 14 HALIM (SESUAI FOTO ACUAN):
        // 1. Atap Limas Tumpang Genteng Merah Bata (2 Tingkat) + Mustaka
        // 2. Dua Kubah Hijau Muda di Bagian Depan Serambi
        // 3. Menara Masjid Kotak Hijau Muda Tinggi di Sisi Kiri Masjid
        // ====================================================================
        const frontZ = bDepth / 2;

        // Dark-green eaves cornice
        const mosqueCornice = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth + 1.4, 0.9, bDepth + 1.4),
          darkGreenTrimMat
        );
        mosqueCornice.position.y = bHeight + 0.45;
        bGroup.add(mosqueCornice);

        // Tier 1 Lower Pyramidal Terracotta Roof (Atap Tumpang Bawah)
        const pyramidLower = new THREE.Mesh(
          new THREE.ConeGeometry(bWidth * 0.56, 4.8, 4),
          terracottaRoofMat
        );
        pyramidLower.rotation.y = Math.PI / 4;
        pyramidLower.position.set(0, bHeight + 2.8, -0.5);
        bGroup.add(pyramidLower);

        // Tier 2 Upper Pyramidal Terracotta Roof (Atap Tumpang Puncak)
        const pyramidUpper = new THREE.Mesh(
          new THREE.ConeGeometry(bWidth * 0.34, 4.2, 4),
          new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.55 })
        );
        pyramidUpper.rotation.y = Math.PI / 4;
        pyramidUpper.position.set(0, bHeight + 6.4, -0.5);
        bGroup.add(pyramidUpper);

        // Roof Peak Finial Spire (Mustaka Puncak Atap Limas)
        const peakSpire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.25, 2.8, 8),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.85, roughness: 0.2 })
        );
        peakSpire.position.set(0, bHeight + 9.4, -0.5);
        bGroup.add(peakSpire);

        // TWO Characteristic Light-Green Small Front Domes (Dua Kubah Hijau Muda di Depan Serambi)
        const frontDomeMat = new THREE.MeshStandardMaterial({
          color: 0xa3e635,
          emissive: 0x4d7c0f,
          emissiveIntensity: 0.18,
          roughness: 0.3,
          metalness: 0.2,
        });
        [-4.2, 4.2].forEach((dx) => {
          const smallDome = new THREE.Mesh(
            new THREE.SphereGeometry(2.35, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
            frontDomeMat
          );
          smallDome.position.set(dx, bHeight + 0.9, frontZ - 1.8);
          bGroup.add(smallDome);

          const domeSpire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.14, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.8 })
          );
          domeSpire.position.set(dx, bHeight + 3.6, frontZ - 1.8);
          bGroup.add(domeSpire);
        });

        // Tall Square Light-Green Minaret Tower (Menara Masjid Al - Huda di Sisi Kiri Masjid)
        const minaretGroup = new THREE.Group();
        minaretGroup.position.set(-bWidth / 2 - 4.2, 0, -1.5);

        const minaretShaft = new THREE.Mesh(
          new THREE.BoxGeometry(4.4, 21.5, 4.4),
          new THREE.MeshStandardMaterial({ color: 0xbbf7d0, roughness: 0.45 })
        );
        minaretShaft.position.y = 10.75;
        minaretGroup.add(minaretShaft);

        const minaretBalcony = new THREE.Mesh(
          new THREE.BoxGeometry(5.4, 0.9, 5.4),
          darkGreenTrimMat
        );
        minaretBalcony.position.y = 18.2;
        minaretGroup.add(minaretBalcony);

        const minaretTopCrown = new THREE.Mesh(
          new THREE.BoxGeometry(3.4, 3.2, 3.4),
          lightGreenMat
        );
        minaretTopCrown.position.y = 22.4;
        minaretGroup.add(minaretTopCrown);

        const minaretDome = new THREE.Mesh(
          new THREE.SphereGeometry(1.7, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
          frontDomeMat
        );
        minaretDome.position.y = 24.0;
        minaretGroup.add(minaretDome);

        const minaretSpire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.18, 2.4, 8),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, metalness: 0.85 })
        );
        minaretSpire.position.y = 26.2;
        minaretGroup.add(minaretSpire);

        bGroup.add(minaretGroup);
      } else {
        // Traditional Indonesian Madrasah Terracotta Pitched Roof (Atap Genteng Merah Bata) with Dark Green Fascia Trim
        const roofFascia = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth + 2.0, 0.95, bDepth + 2.0),
          darkGreenTrimMat
        );
        roofFascia.position.y = bHeight + 0.48;
        bGroup.add(roofFascia);

        const roofLower = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth + 1.2, 1.8, bDepth + 1.0),
          terracottaRoofMat
        );
        roofLower.position.y = bHeight + 1.65;
        bGroup.add(roofLower);

        const roofRidge = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth - 3.2, 2.4, bDepth - 3.6),
          new THREE.MeshStandardMaterial({
            color: 0x9a3412,
            roughness: 0.6,
          })
        );
        roofRidge.position.y = bHeight + 3.4;
        bGroup.add(roofRidge);
      }

      // Classroom / Lab Windows Strip with Dark Green Frames
      const winMesh = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth - 4.5, 2.2, bDepth + 0.25),
        new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          emissive: 0x0ea5e9,
          emissiveIntensity: 0.22,
          roughness: 0.2,
          metalness: 0.5,
        })
      );
      winMesh.position.y = bHeight * 0.76;
      bGroup.add(winMesh);

      // 3D Signboard Above Building
      const signSprite = createBuildingSignboard(
        post.buildingName,
        post.index === 2
          ? 'MASJID AL - HUDA · KAMPUS MTsN 14 JAKARTA TIMUR'
          : 'KAMPUS MTsN 14 JAKARTA TIMUR · HALIM PK',
        post.index === 2 ? '#4ade80' : '#fbbf24'
      );
      signSprite.position.set(0, post.index === 2 ? bHeight + 11.5 : bHeight + 6.8, 0);
      bGroup.add(signSprite);

      scene.add(bGroup);

      // Teacher NPC (Pak Azhary Mardhani, S.Kom) standing on the front plaza facing the walkway!
      const teacherMapY = post.mapY < 750 ? post.mapY + 110 : post.mapY - 110;
      const teacherBx = to3DX(post.mapX);
      const teacherBz = to3DZ(teacherMapY);

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
      teacherRig.group.position.set(teacherBx, 0, teacherBz);
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
      markerCylinder.position.set(teacherBx, 2.75, teacherBz);
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
      const radX = idx % 2 === 0 ? 340 : 560;
      const radY = idx % 2 === 0 ? 220 : 340;
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

    let seedHash = 0;
    const initPid = propsRef.current.localPlayerId || 'p0';
    for (let i = 0; i < initPid.length; i++) {
      seedHash = (seedHash * 31 + initPid.charCodeAt(i)) % 360;
    }
    const initAngle = (seedHash * Math.PI) / 180;
    const defaultSpawnX = Math.round(WORLD_WIDTH / 2 + Math.cos(initAngle) * 52);
    const defaultSpawnY = Math.round(WORLD_HEIGHT / 2 + 30 + Math.sin(initAngle) * 34);

    let localMapX = propsRef.current.teleportCommand?.x ?? defaultSpawnX;
    let localMapY = propsRef.current.teleportCommand?.y ?? defaultSpawnY;
    let localJumpY = 0;
    let localJumpVy = 0;
    let localDashTimer = 0;
    let localDashCooldown = 0;
    let localFacingAngle = Math.PI;
    let localWalkPhase = 0;
    let lastNearbyTeacherIdx: number | null = null;
    let lastNearbyEntrancePostIdx: number | null = null;
    let lastNearbyVersusId: string | null = null;
    let lastTeleportSeq = propsRef.current.teleportCommand?.seq || 0;
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
      const w =
        container.clientWidth ||
        (window.visualViewport ? Math.round(window.visualViewport.width) : window.innerWidth);
      const h =
        container.clientHeight ||
        (window.visualViewport ? Math.round(window.visualViewport.height) : window.innerHeight);
      const aspect = w / Math.max(1, h);
      camera.aspect = aspect;
      camera.fov = aspect < 0.75 ? 66 : aspect < 1.0 ? 60 : 54;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(container);

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

      // Animate Teacher Mission Cylinders & Soaring Halim Airliner
      teacherMarkerMeshes.forEach((cyl, idx) => {
        cyl.rotation.y = elapsed * 0.8 + idx;
        const s = 1 + Math.sin(elapsed * 3 + idx) * 0.06;
        cyl.scale.set(s, 1, s);
      });
      const planeCycle = ((elapsed * 6.5) % 180) - 90;
      halimAirlinerGroup.position.set(planeCycle, 40 + (planeCycle + 90) * 0.08, -58);

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

        // 1B. Check Proximity to 6 Building Entrance Teleport Pads
        let nearestEntrancePost: TeacherPostLocation | null = null;
        for (const post of TEACHER_POSTS) {
          const doorMapX = post.mapX;
          const doorMapY = post.mapY < 750 ? post.mapY + 110 : post.mapY - 110;
          if (Math.hypot(localMapX - doorMapX, localMapY - doorMapY) <= 95) {
            nearestEntrancePost = post;
            break;
          }
        }
        const entranceIdx = nearestEntrancePost ? nearestEntrancePost.index : null;
        if (entranceIdx !== lastNearbyEntrancePostIdx) {
          lastNearbyEntrancePostIdx = entranceIdx;
          currentProps.onNearbyBuildingEntranceChange?.(nearestEntrancePost);
        }

        if ((justPressedKeys.has('KeyE') || justPressedKeys.has('KeyF')) && nearestEntrancePost) {
          soundEngine.playClick();
          currentProps.onEnterBuildingInterior?.(nearestEntrancePost);
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
        const aspectScale = camera.aspect < 0.85 ? 1.25 : 1;
        _vec3A.set(
          Math.cos(orbitAngle) * 76 * aspectScale,
          34 * aspectScale,
          Math.sin(orbitAngle) * 76 * aspectScale
        );
        camera.position.lerp(_vec3A, Math.min(1, dt * 3));
        camera.lookAt(0, 4, 0);
      } else if (currentProps.cameraMode === 'FULL_MAP') {
        const aspect = camera.aspect || 1;
        const mapZoomScale = aspect < 1 ? Math.min(2.15, 1.18 / Math.max(0.42, aspect)) : 1;
        _vec3A.set(0, 140 * mapZoomScale, 88 * mapZoomScale);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _vec3A.x, 6, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _vec3A.y, 6, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _vec3A.z, 6, dt);
        camera.lookAt(0, 0, 2);
      } else {
        const px = to3DX(localMapX);
        const pz = to3DZ(localMapY);
        const effectiveDist = camera.aspect < 0.75 ? cameraDist * 1.14 : cameraDist;
        const camOffsetX = Math.sin(cameraYaw) * Math.cos(cameraPitch) * effectiveDist;
        const camOffsetY = Math.sin(cameraPitch) * effectiveDist + 3.6;
        const camOffsetZ = Math.cos(cameraYaw) * Math.cos(cameraPitch) * effectiveDist;

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

          // 3. Cyan/Emerald Blips + Direction Vectors for Real Online Classmates & Red Blips for NPC Students
          for (const rp of currentProps.players) {
            if (rp.id === currentProps.localPlayerId) continue;
            const rawDx = (rp.x - localMapX) * scaleMap;
            const rawDy = (rp.y - localMapY) * scaleMap;
            const distFromCenter = Math.hypot(rawDx, rawDy);
            const maxBlipRadius = radius - 8;
            const clampedRatio =
              distFromCenter > maxBlipRadius && distFromCenter > 0
                ? maxBlipRadius / distFromCenter
                : 1;
            const px = cx + rawDx * clampedRatio;
            const py = cy + rawDy * clampedRatio;
            const isOnlineHuman = !rp.isRoamingPeer;

            if (isOnlineHuman) {
              rCtx.save();
              rCtx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
              rCtx.lineWidth = 1.25;
              rCtx.setLineDash([3, 3]);
              rCtx.beginPath();
              rCtx.moveTo(cx, cy);
              rCtx.lineTo(px, py);
              rCtx.stroke();
              rCtx.restore();
            }

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
      window.removeEventListener('orientationchange', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
      cityTexture.dispose();
      shadowTexture.dispose();
      skyConstellationTexture.dispose();
      wallCrestTexture.dispose();
      renderer.dispose();
    };
  }, []);

  const maxJoystickRadius = vp.joystickRadiusPx;
  const innerRingSize = Math.round(vp.joystickSizePx * 0.68);
  const knobSize = Math.round(vp.joystickSizePx * 0.44);

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
    const clampedDist = Math.min(dist, maxJoystickRadius);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;
    setJoystickKnob({ x: kx, y: ky });
    touchStickRef.current = {
      x: kx / Math.max(1, maxJoystickRadius),
      y: ky / Math.max(1, maxJoystickRadius),
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
        const clampedDist = Math.min(dist, maxJoystickRadius);
        const angle = Math.atan2(dy, dx);
        const kx = Math.cos(angle) * clampedDist;
        const ky = Math.sin(angle) * clampedDist;
        setJoystickKnob({ x: kx, y: ky });
        touchStickRef.current = {
          x: kx / Math.max(1, maxJoystickRadius),
          y: ky / Math.max(1, maxJoystickRadius),
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
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-slate-950 touch-none">
      <div ref={mountRef} className="w-full h-full touch-none" />

      {/* Resolution-Adaptive GTA San Andreas Circular Radar Mini-Map:
          - Handphone/Tablet (vp.isMobileLayout): Positioned at top-right below compact status bar, dynamically scaled to vp.radarSizePx so it NEVER overlaps the bottom-left Virtual Movement Joystick!
          - Desktop (!vp.isMobileLayout): Positioned at bottom-left */}
      {joinedRoom && (
        <div
          className="fixed z-20 pointer-events-none flex flex-col items-center gap-1"
          style={
            vp.isMobileLayout
              ? {
                  top: vp.isCompactHeight ? 42 : 48,
                  right: 10,
                }
              : {
                  bottom: 20,
                  left: 20,
                }
          }
        >
          <canvas
            ref={radarCanvasRef}
            width={148}
            height={148}
            className="block rounded-full shadow-2xl"
            style={{
              width: `${vp.radarSizePx}px`,
              height: `${vp.radarSizePx}px`,
            }}
          />
          {!vp.isMobileLayout && (
            <span className="inline-block text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-0.5 rounded border border-slate-800">
              G: Pos Guru · ■: Barang · ●: Siswa
            </span>
          )}
        </div>
      )}

      {/* RESOLUTION-ADAPTIVE VIRTUAL ANALOG JOYSTICK & JUMP/DASH PAD */}
      {joinedRoom && vp.isMobileLayout && (
        <>
          {/* Left Thumb Virtual Analog Joystick */}
          <div
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            onTouchCancel={handleJoystickEnd}
            style={{
              width: `${vp.joystickSizePx}px`,
              height: `${vp.joystickSizePx}px`,
              bottom: vp.isCompactHeight ? 10 : 48,
              left: vp.isCompactHeight ? 10 : 12,
            }}
            className="fixed z-20 rounded-full bg-slate-900/80 border-2 border-slate-600/90 shadow-2xl flex items-center justify-center touch-none select-none"
            aria-label="Joystick Virtual Jalan 3D"
          >
            <div
              style={{
                width: `${innerRingSize}px`,
                height: `${innerRingSize}px`,
              }}
              className="rounded-full border border-slate-700/70 flex items-center justify-center pointer-events-none"
            >
              <span className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-500 uppercase">
                JALAN
              </span>
            </div>
            <div
              className="absolute rounded-full bg-emerald-500/90 border-2 border-white shadow-lg pointer-events-none flex items-center justify-center"
              style={{
                width: `${knobSize}px`,
                height: `${knobSize}px`,
                transform: `translate(${joystickKnob.x}px, ${joystickKnob.y}px)`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white/90" />
            </div>
          </div>

          {/* Right Thumb Jump & Dash Action Button */}
          <div
            style={{
              bottom: vp.isCompactHeight ? 12 : 52,
              right: vp.isCompactHeight ? 10 : 12,
            }}
            className="fixed z-20 flex flex-col items-center gap-2"
          >
            <button
              type="button"
              onTouchStart={(e) => {
                e.stopPropagation();
                mobileJumpQueuedRef.current = true;
              }}
              onClick={() => {
                mobileJumpQueuedRef.current = true;
              }}
              style={{
                width: `${vp.jumpBtnSizePx}px`,
                height: `${vp.jumpBtnSizePx}px`,
              }}
              className="rounded-full bg-sky-600/90 active:bg-sky-400 border-2 border-sky-300 shadow-2xl flex flex-col items-center justify-center text-white font-extrabold text-[9px] font-mono leading-tight touch-none select-none"
            >
              <span>LOMPAT</span>
              <span className="text-[7.5px] text-sky-200">DASH</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
