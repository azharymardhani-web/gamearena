# Implementation Plan - Restrict Student CBT Access to Active Chapter Buildings & Enhanced 3D Campus Beacon Navigation

Restricting student CBT test access exclusively to the active chapter's physical 3D campus building set by the teacher, removing direct question selection menus from the student gameplay HUD, adding vertical 3D beacon lights & floating markers above active buildings, and providing visual directional HUD alerts.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed by the user in Phase 1:
> - **Out-of-Building CBT Attempt Alert**: Visual warning banner on HUD with a directional indicator arrow guiding students towards the active building.
> - **3D Visual Beacons on Active Buildings**: Active chapter buildings in the 3D campus will render a vertical glowing light beam, particle rings, and a hovering chapter badge icon above the roof structure.

---

## 1. Overview & Core Concept

- **What It Does**:
  - Ensures students cannot open or attempt CBT questions directly from any menu while exploring the 3D campus.
  - Automatically matches the active CBT exam configuration set by the teacher in the Guru Password menu (`Kangguru00`).
  - Forces students to navigate their 3D character to the exact building matching the active chapter (e.g. Gedung Berpikir Komputasional for Bab 1).
  - Renders prominent 3D beacon lights and floating markers over the active building for easy orientation.
  - Displays HUD navigation guidance if a student approaches an inactive building or attempts CBT away from the destination.

- **Target Audience**: Students of MTsN 14 Halim Jakarta Timur taking CBT exams in a 3D campus environment.

---

## 2. User Experience & Visual Design

- **Student Gameplay HUD**:
  - **No Question Menu**: In-game menu bar for students removes any direct "Pilih Soal" / "Daftar Soal" button.
  - **Active Chapter HUD Banner**: Top-center HUD banner displays current exam status: e.g. `[CBT AKTIF: BAB 1 - BERPIKIR KOMPUTASIONAL]`.
  - **Directional Arrow & Radar Indicator**: If a student is not inside the active building zone, the HUD displays a directional indicator with remaining distance (e.g., `Gedung Active: 24m ↗`).

- **3D Campus Scene (`CyberArenaCanvas.tsx`)**:
  - **Glowing Beacon Beams**: Vertical semi-transparent light cylinders extending into the sky over buildings that match active chapters.
  - **Floating Holographic Badge**: Animated 3D floating chapter badge above the entrance of active buildings.
  - **Building Station Lock/Unlock Visuals**: Inactive buildings display subtle red lock status indicators; active buildings display glowing green entry zones.

- **CBT Access Station Interaction (`VersusAndTeacherModals.tsx` & `BuildingInteriorModal.tsx`)**:
  - If student interacts with the station inside the **Active Building**: CBT launches directly with pre-set question count & active chapter items without allowing question filtering or menu choices.
  - If student interacts with the station inside an **Inactive Building**: A warning modal appears with exact coordinates and directional instructions to walk to the designated active building.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Removal of Direct CBT Menu from Student Controls**
  - *Chosen Approach*: Completely hide and strip any question selection buttons from the student HUD floating toolbar.
  - *Why*: Prevents students from bypassing physical 3D navigation and opening question lists directly.

- **Decision 2: Automatic Test Activation on Interaction with Active Building**
  - *Chosen Approach*: When entering an active building station, the student CBT modal directly starts the teacher-configured test parameters.
  - *Why*: Streamlines exam start while guaranteeing zero student tampering with chapter filters or question limits.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       Teacher Menu                          │
│               (Password: Kangguru00 Protected)              │
│  - Active Chapters Selection (e.g., Bab 1 ON, Bab 2 OFF)     │
│  - Question Count Limit (e.g., 20 Soal)                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Writes global state
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     App Global State                        │
│  - activeCategory (Derived from active chapters)             │
│  - activeQuestionCount                                       │
│  - isTeacher mode indicator                                 │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐┌──────────────────────────────┐
│     3D Cyber Arena Scene     ││        Student HUD           │
│  (CyberArenaCanvas.tsx)      ││         (App.tsx)            │
│  - Render Glowing Beacons    ││  - No CBT Question Select    │
│    over active buildings     ││  - Active Exam Status Bar    │
│  - Distance & Angle Calc     ││  - Directional Arrow to      │
│    to Active Building        ││    Active Building Zone     │
└──────────────┬───────────────┘└──────────────────────────────┘
               │
               ▼ (Player reaches zone)
┌─────────────────────────────────────────────────────────────┐
│                  Building Interior / Station                │
│  - Check if Building Zone matches Active Chapter            │
│    -> If MATCH: Auto-start CBT with Teacher parameters      │
│    -> If MISMATCH: Block access & show HUD Direction Warning│
└─────────────────────────────────────────────────────────────┘
```

### Component & File Mapping:
1. `src/App.tsx`: Clean student gameplay HUD, remove student question menu buttons, add active exam banner and HUD directional pointer.
2. `src/components/CyberArenaCanvas.tsx`: Render 3D beacon beams, particle effects, and floating badges above active chapter buildings.
3. `src/components/VersusAndTeacherModals.tsx`: Strictly enforce auto-activation of pre-configured CBT test when interacting with active station, block interactive filter dropdowns for students, display clear redirection warning if at wrong building.

---
