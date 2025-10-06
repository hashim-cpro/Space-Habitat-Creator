
1. **`airlock-detailed.stl`**

   - Detailed airlock with hatch mechanisms
   - Reference size: 2.5m diameter × 3.0m length
   - Features: Outer hatch, inner hatch, handrails, control panels
   - Attachment points: Front (habitat side), Back (EVA side)

2. **`node-4way.stl`**

   - Four-port junction node (cross configuration)
   - Reference size: 2.5m sphere with 4 × 0.8m ports
   - Port directions: +X, -X, +Y, -Y (no Z ports)
   - Attachment points: 4 radial ports

3. **`node-6way.stl`**
   - Six-port junction node (full 3D hub)
   - Reference size: 3.0m sphere with 6 × 0.8m ports
   - Port directions: ±X, ±Y, ±Z (all axes)
   - Attachment points: 6 radial ports

#### **Priority 2: Specialized Equipment**

4. **`solar-array.stl`**

   - Deployable solar panel array
   - Reference size: 10m × 4m × 0.2m
   - Features: Panel segments, support struts, mounting bracket
   - Attachment point: Base mounting point

5. **`antenna-dish.stl`**

   - Parabolic communications antenna
   - Reference size: 2m diameter dish
   - Features: Dish, feed horn, gimbal mount
   - Attachment point: Base mounting bracket

6. **`docking-adapter.stl`**
   - NASA-standard docking collar
   - Reference size: 1.0m diameter × 0.5m depth
   - Features: Petals, alignment guides, seal ring
   - Attachment points: Both ends

#### **Priority 3: Advanced Modules**

7. **`observation-cupola.stl`**

   - Multi-window observation dome
   - Reference size: 3m diameter × 2m height
   - Features: 6-7 windows, window frames, shutters
   - Attachment point: Base (downward facing)

8. **`plant-growth-rack.stl`**
   - Hydroponic/aeroponic plant growth system
   - Reference size: 2m × 1m × 2m rack unit
   - Features: Multiple trays, lighting, plumbing
   - Can be placed inside modules (not external)

---

## 📐 **Model Requirements**

When creating STL files, please follow these specs:

### **Scale**

- **1 unit = 1 meter** in your 3D software
- Example: A 3m diameter module should be 3.0 units in Blender

### **Origin Point**

- Place model **centered at origin** (0, 0, 0)
- Primary axis along **Z-axis** (length/height)
- For cylindrical modules: Z = length axis

### **Attachment Points**

Mark attachment points with **small sphere primitives** (0.1m radius):

```
Name spheres: "attach_front", "attach_back", "attach_north", etc.
Position: Exact center of docking surface
```

### **Geometry**

- **Manifold geometry** (watertight, no holes)
- **Quads preferred** for smooth subdivision
- **Polycount**: 10k-50k triangles (not too heavy)
- **No overlapping faces**
- **Correct normals** (facing outward)

### **Details**

Add realistic details but keep polycount reasonable:

- Panel lines (subtle extrusion/indent)
- Handrails (if external EVA access)
- Hatches/doors (modeled closed)
- Labels/markings (baked texture or geometry)

### **File Format**

- **Primary**: `.stl` (binary, not ASCII)
- **Alternative**: `.glb` (if including materials/textures)
- Filename: lowercase, hyphens, descriptive

---

## 🎨 **Texturing (Optional)**

If using GLB format, you can include basic PBR materials:

- **Metallic modules**: Gray metallic with slight roughness
- **Inflatable modules**: White/beige fabric appearance
- **Details**: Darker panel lines, yellow caution stripes

STL files will get default gray material in the app.

---

## 📦 **File Naming Convention**

```
<category>-<name>-<variant>.stl

Examples:
- airlock-detailed.stl
- node-4way.stl
- node-6way.stl
- solar-array-deployable.stl
- antenna-dish-2m.stl
- docking-adapter-standard.stl
- cupola-observation-7window.stl
- plant-rack-hydroponic.stl
```

---

## 🧪 **Testing Your Models**

Before submitting, test in Blender:

1. **Scale Check**: Measure bounding box (should match specs)
2. **Origin Check**: Object center at (0,0,0)
3. **Normals Check**: Recalculate outside normals
4. **Manifold Check**: 3D Print Toolbox → Check for non-manifold
5. **Export Test**: Export STL → Re-import → Check for issues

---

## 📊 **Model Status Tracking**

| Model                  | Priority | Status      | Notes             |
| ---------------------- | -------- | ----------- | ----------------- |
| airlock-detailed.stl   | P1       | ⏳ Needed   | Critical for EVA  |
| node-4way.stl          | P1       | ⏳ Needed   | Core junction     |
| node-6way.stl          | P1       | ⏳ Needed   | Central hub       |
| solar-array.stl        | P2       | ⏳ Needed   | Decorative/visual |
| antenna-dish.stl       | P2       | ⏳ Needed   | Decorative/visual |
| docking-adapter.stl    | P2       | ⏳ Needed   | Connection detail |
| cupola-observation.stl | P3       | 📋 Optional | Nice to have      |
| plant-rack.stl         | P3       | 📋 Optional | Interior element  |

**Status Legend:**

- ⏳ Needed - Required for system
- 📋 Optional - Can add later
- ✅ Complete - Model ready
- 🔧 In Progress - Being modeled
- ❌ Blocked - Waiting on decision

---

## 🚀 **Quick Start for Modelers**

If you're creating these models:

1. **Download reference images** from NASA (ISS modules, Bigelow BEAM, etc.)
2. **Set up Blender** with 1 unit = 1 meter
3. **Model the basic shape** first
4. **Add details** progressively
5. **Add attachment spheres** at connection points
6. **Export as STL** (binary format)
7. **Test import** in the habitat creator tool

---

## 📚 **Reference Resources**

- NASA ISS Module Dimensions: [Link]
- Bigelow Inflatable Specs: [Link]
- Common Berthing Mechanism (CBM): Standard docking size
- Pressurized Mating Adapter (PMA): Alternative docking
- ESA Columbus Module: 4.5m diameter reference

---

## 💬 **Questions?**

If unsure whether to model something or let code generate it:

**Rule of thumb:**

- **Complex geometry with specific details** → STL file
- **Simple shape with variable dimensions** → Procedural code

When in doubt, ask before spending time modeling!
