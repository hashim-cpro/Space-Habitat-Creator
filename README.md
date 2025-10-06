<div align="center">

# 🛰️ Nexus Habitat Creator

**A lightweight browser-based 3D sandbox for rapid interior & exterior space habitat layout design**  
Team project for the **NASA Space Apps Challenge (local hackathon submission)**.

</div>

> interior desgin tool has been removed from the deployed version for now due to some bugs and basically because of it being incomplete, i am working on it atm.

## 🚀 Overview

This tool lets us sketch, iterate, and evaluate modular off‑Earth habitat configurations fast—no installs, just open and build. Users add procedural or imported modules, lay out interior elements, tag semantic Functional Zones (sleep, work, hygiene, storage, social, exercise, staging), and export scenes for fabrication, simulation, or further analysis. It sits intentionally between “blank 3D canvas” and “heavy CAD,” focusing on early concept clarity and human‑centered planning.

## � Challenge Context & NASA Resources Used

The challenge required referencing NASA resources. We grounded design decisions in:

1. **Defining the Net Habitable Volume for Long Duration Exploration Missions**  
   https://ntrs.nasa.gov/api/citations/20200002973/downloads/20200002973.pdf  
   → Informed Functional Zone definitions, volumetric efficiency thinking, and future intent to score usable volume vs. gross volume.

2. **Habitats and Surface Construction Technology and Development Roadmap**  
   https://spacearchitect.org/pubs/NASA-CP-97-206241-Cohen.pdf  
   → Inspired module taxonomy (inflatable vs. rigid, connectors, nodes), expansion sequencing, and procedural module set.

These documents were used strictly for conceptual guidance—no reproduction of NASA logos, marks, or protected imagery.

## 🔧 Core Features

- Multi‑project management (local persistence, auto‑save, instant resume)
- Procedural module generators (cylinders, inflatable variants, domes, tunnels, adapters, docking ports)
- Import external geometry (GLB / GLTF / STL) → normalized into editable custom objects
- Export scene as JSON (structured schema), STL (fabrication/printing), GLB (interchange)
- Functional Zones tagging layer (semantic intent over raw meshes)
- Transform tools: move / rotate / scale, axis lock, multi‑select, duplicate, hide/show
- Undo / redo history manager
- Parameter editing panel for procedural modules
- Basic collision/spawn assistance (free position finder)
- Touch gesture support groundwork (mobile/tablet usability path)
- Lightweight physics + future hooks scaffold

## 🧠 Functional Zones (Semantic Layer)

Instead of only pushing meshes around, users label volumes with intended use (e.g., sleep, hygiene, work, social). This enables future analytics: adjacency checks, redundancy, ergonomic coverage, circulation path planning, and net habitable volume metrics derived from tagged regions.

## 📦 Import / Export Workflow

| Action | Formats          | Notes                                                                         |
| ------ | ---------------- | ----------------------------------------------------------------------------- |
| Import | GLB / GLTF / STL | Geometry converted to internal blueprint; triangle count sanity warnings      |
| Export | JSON             | Structured schema (objects, transforms, parameters, material)                 |
| Export | STL              | Binary preferred; baked transforms; suitable for printing / mechanical review |
| Export | GLB              | Single packaged scene for viewers / pipelines                                 |

## 🛠️ Tech Stack

- **React + Vite**: Fast iteration + modern build pipeline
- **Three.js + @react-three/fiber + @react-three/drei**: Declarative 3D scene, helpers, loaders
- **three-mesh-bvh**: Spatial acceleration potential (future collision/queries)
- **three-csg-ts**: Constructive solid geometry utilities (future boolean ops expansion)
- **Custom procedural generators**: Parametric habitat module geometry
- **LocalStorage project layer**: Auto‑save & multi‑project
- **Export pipeline**: GLTFExporter, STLExporter, structured JSON serializer
- **Import pipeline**: GLTFLoader, STLLoader with material + transform normalization
- **HistoryManager**: Undo/redo stack abstraction
- **Analytics**: Lightweight Vercel script injection (no Next.js dependency)

## 🧪 Current Status & Philosophy

Early-stage concept tool: keep UI lean, iteration fast, semantics rich. Priorities: clarity > visual polish, extensibility > one‑off hacks. Performance tactics: selective re-rendering, baked geometry reuse preparation, lightweight material sets.

## 🛤️ Roadmap (Planned / Aspirational)

- Functional Zone adjacency & redundancy scoring
- Net Habitable Volume estimation overlay
- Reach & clearance heuristic checks
- Multi‑deck interior integration (interior subsystem merge)
- Procedural pathing / circulation suggestions
- Physics & environment placeholder integration (radiation, atmosphere modules)
- Optional cloud sync + collaborative editing
- Instancing for repetitive fixtures (beds, racks, lockers)
- Constraint solver (alignment, docking ring validation)

## 🤖 AI Assistance Disclosure

Brief, transparent usage:

- Submission + README wording refinement (human concepts; AI tightened phrasing)
- Lightweight code autocomplete suggestions (React component scaffolds, small utilities) — all reviewed & edited
- No AI-generated images, audio, or NASA branding; no autonomous layout or optimization

## 👥 Team & Attribution

Built by a local hackathon team for the NASA Space Apps Challenge. All architectural/feature decisions, Functional Zone definitions, and module taxonomy are original interpretations informed by publicly available NASA resources (listed above). No official endorsement implied.

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

## 🧩 Procedural Module Set (Current)

- Rigid cylinders (size‑variant, parametric)
- Inflatable cylinder variants
- Multi‑level / adapter cylinders
- Domes (full & shallow)
- Tunnels / connectors
- Docking ports / adapters
- Attachment markers (structural reference)

## 🕹️ Key Interactions

| Action           | Shortcut / Gesture                |
| ---------------- | --------------------------------- |
| Undo / Redo      | Ctrl+Z / Ctrl+Shift+Z (or Ctrl+Y) |
| Delete selection | Delete / Backspace                |
| Axis lock toggle | X / Y / Z                         |
| Clear axis lock  | Esc                               |

## 🔐 Licensing & NASA Use Disclaimer

This project references NASA-authored technical papers for design reasoning only. It does **not** use NASA logos, flags, or mission insignia. Any future NASA-related data integrations will follow branding and usage policies.

## � Contributing (Post-Challenge)

Potential future contributions: optimization algorithms, ergonomic analytics, collaborative editing layer, UI refinement. Open to structured contributions after judging window.

---

“Design fast, label intent early, optimize later.” — Team Nexus
