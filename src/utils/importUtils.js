import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

// Utility: generate a safe material object from a THREE.Material
function extractMaterial(mat) {
  if (!mat) {
    return {
      color: "#888888",
      selectedColor: "#4a9cff",
      hoverColor: "#6ab0ff",
      metalness: 0.5,
      roughness: 0.5,
      opacity: 1,
      transparent: false,
      wireframe: false,
    };
  }
  const color = mat.color ? `#${mat.color.getHexString()}` : "#888888";
  return {
    color,
    selectedColor: "#4a9cff",
    hoverColor: "#6ab0ff",
    metalness: mat.metalness !== undefined ? mat.metalness : 0.5,
    roughness: mat.roughness !== undefined ? mat.roughness : 0.5,
    opacity: mat.opacity !== undefined ? mat.opacity : 1,
    transparent: !!mat.transparent,
    wireframe: !!mat.wireframe,
  };
}

// Normalize mesh into internal object blueprint (without id which caller sets)
function meshToObjectBlueprint(mesh, nameHint) {
  // Compute bounding box to center if necessary (we keep original for now)
  const geometry = mesh.geometry.clone();
  return {
    name: nameHint || mesh.name || "Imported Mesh",
    type: "custom",
    parameters: { geometry },
    transform: {
      position: mesh.position.toArray(),
      rotation: mesh.rotation.toArray().slice(0, 3),
      scale: mesh.scale.toArray(),
    },
    material: extractMaterial(mesh.material),
  };
}

export async function importGLBFile(file) {
  const loader = new GLTFLoader();
  const arrayBuffer = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    loader.parse(
      arrayBuffer,
      "",
      (gltf) => {
        const blueprints = [];
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            blueprints.push(meshToObjectBlueprint(child, file.name));
          }
        });
        resolve(blueprints);
      },
      (err) => reject(err)
    );
  });
}

export async function importSTLFile(file) {
  const loader = new STLLoader();
  const arrayBuffer = await file.arrayBuffer();
  const geometry = loader.parse(arrayBuffer);
  // Provide default transform and material
  return [
    {
      name: file.name.replace(/\.[^.]+$/, ""),
      type: "custom",
      parameters: { geometry },
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      material: extractMaterial(),
    },
  ];
}

export async function importFiles(fileList, { maxTriangles = 150000 } = {}) {
  const results = [];
  for (const file of fileList) {
    const ext = file.name.split(".").pop().toLowerCase();
    try {
      let blueprints = [];
      if (ext === "glb" || ext === "gltf") {
        blueprints = await importGLBFile(file);
      } else if (ext === "stl") {
        blueprints = await importSTLFile(file);
      } else {
        console.warn("Unsupported file type:", file.name);
        continue;
      }
      // Light performance gate: warn if any blueprint geometry too heavy
      blueprints.forEach((bp) => {
        const geo = bp.parameters.geometry;
        const triCount = geo.index
          ? geo.index.count / 3
          : geo.attributes.position.count / 3;
        if (triCount > maxTriangles) {
          console.warn(
            `Imported mesh '${bp.name}' has ${triCount} triangles (over ${maxTriangles}). Consider optimizing.`
          );
        }
      });
      results.push(...blueprints);
    } catch (e) {
      console.error("Failed to import", file.name, e);
    }
  }
  return results;
}
