import * as THREE from "three";
import { CSG } from "three-csg-ts";

// Boolean Operations using CSG
export function unionMeshes(mesh1, mesh2) {
  try {
    const result = CSG.union(mesh1, mesh2);
    return result;
  } catch (error) {
    console.error("Union operation failed:", error);
    return null;
  }
}

export function subtractMeshes(mesh1, mesh2) {
  try {
    const result = CSG.subtract(mesh1, mesh2);
    return result;
  } catch (error) {
    console.error("Subtract operation failed:", error);
    return null;
  }
}

export function intersectMeshes(mesh1, mesh2) {
  try {
    const result = CSG.intersect(mesh1, mesh2);
    return result;
  } catch (error) {
    console.error("Intersect operation failed:", error);
    return null;
  }
}

// Face Extrusion
export function extrudeFace(geometry, faceIndex, distance) {
  const newGeometry = geometry.clone();
  const positionAttribute = newGeometry.attributes.position;
  const normalAttribute = newGeometry.attributes.normal;

  // Get face vertices
  const index = newGeometry.index;
  const i1 = index.getX(faceIndex * 3);
  const i2 = index.getX(faceIndex * 3 + 1);
  const i3 = index.getX(faceIndex * 3 + 2);

  // Get face normal
  const normal = new THREE.Vector3(
    normalAttribute.getX(i1),
    normalAttribute.getY(i1),
    normalAttribute.getZ(i1)
  ).normalize();

  // Move vertices along normal
  const vertices = [i1, i2, i3];
  vertices.forEach((vertexIndex) => {
    const x = positionAttribute.getX(vertexIndex);
    const y = positionAttribute.getY(vertexIndex);
    const z = positionAttribute.getZ(vertexIndex);

    positionAttribute.setXYZ(
      vertexIndex,
      x + normal.x * distance,
      y + normal.y * distance,
      z + normal.z * distance
    );
  });

  positionAttribute.needsUpdate = true;
  newGeometry.computeVertexNormals();

  return newGeometry;
}

// Get face data for selection
export function getFaceData(geometry, faceIndex) {
  const positionAttribute = geometry.attributes.position;
  const normalAttribute = geometry.attributes.normal;
  const index = geometry.index;

  if (!index) return null;

  const i1 = index.getX(faceIndex * 3);
  const i2 = index.getX(faceIndex * 3 + 1);
  const i3 = index.getX(faceIndex * 3 + 2);

  const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i1);
  const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i2);
  const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i3);

  const normal = new THREE.Vector3().fromBufferAttribute(normalAttribute, i1);

  // Calculate face center
  const center = new THREE.Vector3().add(v1).add(v2).add(v3).divideScalar(3);

  return {
    vertices: [v1, v2, v3],
    normal,
    center,
    indices: [i1, i2, i3],
  };
}

// Create plane geometry from face
export function createPlaneFromFace(faceData, worldMatrix) {
  const { center, normal, vertices } = faceData;

  // Transform to world space
  const worldCenter = center.clone().applyMatrix4(worldMatrix);
  const worldNormal = normal
    .clone()
    .transformDirection(worldMatrix)
    .normalize();

  // Calculate plane basis vectors
  const v1 = vertices[0].clone().applyMatrix4(worldMatrix);
  const v2 = vertices[1].clone().applyMatrix4(worldMatrix);

  const uAxis = v2.clone().sub(v1).normalize();
  const vAxis = worldNormal.clone().cross(uAxis).normalize();

  return {
    center: worldCenter,
    normal: worldNormal,
    uAxis,
    vAxis,
    quaternion: new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(uAxis, vAxis, worldNormal)
    ),
  };
}

// Fillet/Chamfer edge
export function filletEdge(geometry, edgeVertices, radius) {
  const newGeometry = geometry.clone();
  // Implementation would require complex mesh subdivision
  // For now, return original geometry
  // Full implementation would use subdivision and smoothing
  console.log("Fillet edge:", edgeVertices, radius);
  return newGeometry;
}

// Mirror geometry across plane
export function mirrorGeometry(geometry, plane) {
  const newGeometry = geometry.clone();
  const positionAttribute = newGeometry.attributes.position;

  for (let i = 0; i < positionAttribute.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(
      positionAttribute,
      i
    );
    const mirrored = vertex
      .clone()
      .reflect(plane.normal)
      .add(plane.normal.clone().multiplyScalar(2 * plane.constant));
    positionAttribute.setXYZ(i, mirrored.x, mirrored.y, mirrored.z);
  }

  positionAttribute.needsUpdate = true;
  newGeometry.computeVertexNormals();

  return newGeometry;
}

// Array/Pattern operations
export function linearArray(object, direction, count, spacing) {
  const instances = [];
  for (let i = 0; i < count; i++) {
    const offset = direction.clone().multiplyScalar(i * spacing);
    instances.push({
      position: object.position.clone().add(offset),
      rotation: object.rotation.clone(),
      scale: object.scale.clone(),
    });
  }
  return instances;
}

export function circularArray(object, axis, center, count, angle) {
  const instances = [];
  const angleStep = angle / count;

  for (let i = 0; i < count; i++) {
    const rotation = new THREE.Quaternion().setFromAxisAngle(
      axis,
      angleStep * i
    );
    const position = object.position
      .clone()
      .sub(center)
      .applyQuaternion(rotation)
      .add(center);

    instances.push({
      position,
      rotation: object.rotation.clone(),
      scale: object.scale.clone(),
    });
  }
  return instances;
}
