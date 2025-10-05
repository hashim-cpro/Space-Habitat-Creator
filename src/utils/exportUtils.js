import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

export function exportToJSON(objects) {
  const exportData = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    objects: objects.map((obj) => ({
      id: obj.id,
      name: obj.name,
      type: obj.type,
      parameters: obj.parameters,
      transform: obj.transform,
      material: obj.material,
    })),
  };

  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, "model.json", "application/json");
}

// Removed OBJ export per new simplified scope (GLB + STL + JSON only)

export function exportToSTL(objects) {
  console.log("Exporting to STL, objects count:", objects.length);

  // Use Three.js STLExporter for reliable STL generation
  const exporter = new STLExporter();
  const scene = new THREE.Scene();

  objects.forEach((obj, index) => {
    let geometry;

    // Handle geometry in priority order: root > parameters > userData > create new
    if (obj.geometry) {
      geometry = obj.geometry.clone();
      console.log(`Object ${index}: Using root geometry for ${obj.name}`);
    } else if (obj.parameters?.geometry) {
      geometry = obj.parameters.geometry.clone();
      console.log(`Object ${index}: Using parameters.geometry for ${obj.name}`);
    } else if (obj.userData?.geometry) {
      geometry = obj.userData.geometry.clone();
      console.log(`Object ${index}: Using userData.geometry for ${obj.name}`);
    } else {
      geometry = createGeometry(obj.type, obj.parameters);
      console.log(
        `Object ${index}: Created ${obj.type} geometry for ${obj.name}`
      );
    }

    // Ensure geometry is properly indexed and has normals
    if (!geometry.index) {
      console.log(`Object ${index}: Converting to indexed geometry`);
      // Three.js BufferGeometry is non-indexed by default for some loaders
      // We don't need to convert, STLExporter handles it
    }

    if (!geometry.attributes.normal) {
      console.log(`Object ${index}: Computing normals`);
      geometry.computeVertexNormals();
    }

    const material = new THREE.MeshStandardMaterial({
      color: obj.material.color,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = obj.name;
    mesh.position.fromArray(obj.transform.position);
    mesh.rotation.fromArray(obj.transform.rotation);
    mesh.scale.fromArray(obj.transform.scale);

    // Apply transforms to geometry for export
    mesh.updateMatrix();
    geometry.applyMatrix4(mesh.matrix);

    // Reset mesh transform after baking
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);

    scene.add(mesh);
  });

  try {
    // Export as binary STL for smaller file size and better compatibility
    const stlData = exporter.parse(scene, { binary: true });
    console.log(
      "STL export successful, size:",
      stlData.byteLength || stlData.length
    );

    if (stlData instanceof ArrayBuffer) {
      downloadFile(stlData, "model.stl", "application/octet-stream");
    } else {
      // Fallback to ASCII STL
      downloadFile(stlData, "model.stl", "text/plain");
    }
  } catch (error) {
    console.error("STL export failed:", error);
    alert("STL export failed. Check console for details.");
  }

  // Cleanup
  scene.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  });
}

export function exportToGLB(objects) {
  console.log("Exporting to GLB, objects count:", objects.length);

  // Construct a temporary scene with actual meshes
  const scene = new THREE.Scene();

  objects.forEach((obj, index) => {
    // Handle geometry in priority order: root > parameters > userData > create new
    let geometry;
    if (obj.geometry) {
      geometry = obj.geometry.clone();
      console.log(`Object ${index}: Using root geometry for ${obj.name}`);
    } else if (obj.parameters?.geometry) {
      geometry = obj.parameters.geometry.clone();
      console.log(`Object ${index}: Using parameters.geometry for ${obj.name}`);
    } else if (obj.userData?.geometry) {
      geometry = obj.userData.geometry.clone();
      console.log(`Object ${index}: Using userData.geometry for ${obj.name}`);
    } else {
      geometry = createGeometry(obj.type, obj.parameters);
      console.log(
        `Object ${index}: Created ${obj.type} geometry for ${obj.name}`
      );
    }

    // Ensure normals exist
    if (!geometry.attributes.normal) {
      console.log(`Object ${index}: Computing normals`);
      geometry.computeVertexNormals();
    }

    const material = new THREE.MeshStandardMaterial({
      color: obj.material.color,
      metalness: obj.material.metalness,
      roughness: obj.material.roughness,
      transparent: obj.material.transparent,
      opacity: obj.material.opacity,
      wireframe: obj.material.wireframe,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = obj.name;
    mesh.position.fromArray(obj.transform.position);
    mesh.rotation.fromArray(obj.transform.rotation);
    mesh.scale.fromArray(obj.transform.scale);
    scene.add(mesh);
  });

  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (result) => {
      if (result instanceof ArrayBuffer) {
        console.log("GLB export successful, size:", result.byteLength);
        downloadFile(result, "scene.glb", "model/gltf-binary");
      } else {
        const json = JSON.stringify(result, null, 2);
        console.log("GLTF export successful, size:", json.length);
        downloadFile(json, "scene.gltf", "application/json");
      }

      // Cleanup
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    },
    (error) => {
      console.error("GLB export failed:", error);
      alert("GLB export failed. Check console for details.");
    },
    { binary: true }
  );
}

function createGeometry(type, parameters) {
  switch (type) {
    case "box":
      return new THREE.BoxGeometry(
        parameters.width,
        parameters.height,
        parameters.depth
      );
    case "sphere":
      return new THREE.SphereGeometry(parameters.radius, 32, 32);
    case "cylinder":
      return new THREE.CylinderGeometry(
        parameters.radiusTop,
        parameters.radiusBottom,
        parameters.height,
        32
      );
    case "cone":
      return new THREE.ConeGeometry(parameters.radius, parameters.height, 32);
    case "torus":
      return new THREE.TorusGeometry(
        parameters.radius,
        parameters.tube,
        16,
        100
      );
    case "plane":
      return new THREE.PlaneGeometry(parameters.width, parameters.height);
    case "custom":
    case "imported":
      // Return a placeholder geometry; actual geometry should be passed directly
      return parameters.geometry
        ? parameters.geometry.clone()
        : new THREE.BoxGeometry(1, 1, 1);
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

function downloadFile(content, filename, mimeType) {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
