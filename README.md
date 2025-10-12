<div align="center">

# 🛰️ Nexus Habitat Creator

**A lightweight browser-based 3D sandbox for rapid interior & exterior space habitat layout design**  
Team project for the **NASA Space Apps Challenge (local hackathon submission)**.

</div>

> interior desgin tool has been removed from the deployed version for now due to some bugs and basically because of it being incomplete, i am working on it atm.


A wannabe CAD type tool in which you can build a habitat from basic prebuilt modules or import your custom modules, make a habitat and then export it in various 3d formats as well. It allows for exterior and interior habitat layout design. It also saves everything currently in localstorage, i will add a backend later though.

## � Challenge Context & NASA Resources Used

The challenge required referencing NASA resources. We grounded design decisions in:

1. **Defining the Net Habitable Volume for Long Duration Exploration Missions**  
   https://ntrs.nasa.gov/api/citations/20200002973/downloads/20200002973.pdf  
   → Informed Functional Zone definitions, volumetric efficiency thinking, and future intent to score usable volume vs. gross volume.

2. **Habitats and Surface Construction Technology and Development Roadmap**  
   https://spacearchitect.org/pubs/NASA-CP-97-206241-Cohen.pdf  
   → Inspired module taxonomy (inflatable vs. rigid, connectors, nodes), expansion sequencing, and procedural module set.

These documents were used strictly for conceptual guidance—no reproduction of NASA logos, marks, or protected imagery.



##  Import / Export Workflow
import export supported in stl, glb and json. 

## Tech Stack
just take a look at the package jdon for this


## Quick Start

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


