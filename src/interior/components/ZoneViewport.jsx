/**
 * Functional Zone Viewport
 * Interactive 3D view for placing and managing functional zones
 */

import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import {
  createFunctionalZone,
  createZoneMesh,
  updateZoneMesh,
} from "../utils/functionalZones";
import {
  constrainToContainer,
  adaptZoneToContainer,
  resolveZoneCollisions,
  zonesOverlap,
} from "../utils/zoneConstraints";
import ZoneTransformToolbar from "./ZoneTransformToolbar";
import "./ZoneViewport.css";

function ZoneViewport({
  exteriorObjects,
  zones,
  onZonesChange,
  selectedZoneId,
  onSelectZone,
  onDropZone,
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const orbitControlsRef = useRef(null);
  const dragControlsRef = useRef(null);
  const transformControlsRef = useRef(null);
  const zoneMeshesRef = useRef(new Map());
  const containerMeshesRef = useRef([]);
  const isDraggingRef = useRef(false);
  const rafRef = useRef(null);

  const [hoveredZone] = useState(null);
  const [draggedZoneType, setDraggedZoneType] = useState(null);
  const [transformMode, setTransformMode] = useState("translate");

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 15, 15);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = true;
    orbitControlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-10, -10, -5);
    scene.add(directionalLight2);

    // Grid helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x4a90e2, 0x2a2a4f);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Render exterior objects as wireframe containers
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing container meshes
    containerMeshesRef.current.forEach((mesh) => {
      sceneRef.current.remove(mesh);
      mesh.geometry?.dispose();
      mesh.material?.dispose();
    });
    containerMeshesRef.current = [];

    // Add exterior objects
    exteriorObjects.forEach((obj) => {
      if (!obj.geometry || !obj.geometry.isBufferGeometry) return;

      // Semi-transparent container
      const containerMesh = new THREE.Mesh(
        obj.geometry,
        new THREE.MeshStandardMaterial({
          color: obj.material?.color || 0xcccccc,
          transparent: true,
          opacity: 0.1,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );

      containerMesh.position.set(...(obj.transform?.position || [0, 0, 0]));
      containerMesh.rotation.set(...(obj.transform?.rotation || [0, 0, 0]));
      containerMesh.scale.set(...(obj.transform?.scale || [1, 1, 1]));
      containerMesh.userData.isContainer = true;

      // Wireframe edges
      const edges = new THREE.EdgesGeometry(obj.geometry, 15);
      const edgeLines = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({
          color: obj.material?.color || 0xffffff,
          transparent: true,
          opacity: 0.6,
        })
      );
      containerMesh.add(edgeLines);

      sceneRef.current.add(containerMesh);
      containerMeshesRef.current.push(containerMesh);
    });
  }, [exteriorObjects]);

  // Render functional zones
  useEffect(() => {
    if (!sceneRef.current) return;

    // Update or create zone meshes
    zones.forEach((zone) => {
      let zoneMesh = zoneMeshesRef.current.get(zone.id);

      if (!zoneMesh) {
        // Create new mesh
        zoneMesh = createZoneMesh(zone);
        sceneRef.current.add(zoneMesh);
        zoneMeshesRef.current.set(zone.id, zoneMesh);
      } else {
        // Update existing mesh
        updateZoneMesh(zoneMesh, zone);
      }

      // Highlight selected zone
      if (zone.id === selectedZoneId) {
        zoneMesh.material.emissiveIntensity = 0.5;
        zoneMesh.material.opacity = zone.opacity + 0.1;
      } else {
        zoneMesh.material.emissiveIntensity = 0.2;
        zoneMesh.material.opacity = zone.opacity;
      }
    });

    // Remove meshes for deleted zones
    const zoneIds = new Set(zones.map((z) => z.id));
    zoneMeshesRef.current.forEach((mesh, id) => {
      if (!zoneIds.has(id)) {
        sceneRef.current.remove(mesh);
        mesh.geometry?.dispose();
        mesh.material?.dispose();
        zoneMeshesRef.current.delete(id);
      }
    });

    // Setup drag controls for zone meshes
    if (zoneMeshesRef.current.size > 0 && !dragControlsRef.current) {
      const draggableObjects = Array.from(zoneMeshesRef.current.values());
      const dragControls = new DragControls(
        draggableObjects,
        cameraRef.current,
        rendererRef.current.domElement
      );

      dragControls.addEventListener("dragstart", (event) => {
        isDraggingRef.current = true;
        orbitControlsRef.current.enabled = false;
        const zoneId = event.object.userData.zoneId;
        onSelectZone(zoneId);
      });

      dragControls.addEventListener("drag", (event) => {
        const zoneId = event.object.userData.zoneId;
        const zone = zones.find((z) => z.id === zoneId);
        if (!zone) return;

        // Update zone position with validation
        const newPosition = [
          isNaN(event.object.position.x) ? 0 : event.object.position.x,
          isNaN(event.object.position.y) ? 0 : event.object.position.y,
          isNaN(event.object.position.z) ? 0 : event.object.position.z,
        ];

        let updatedZone = { ...zone, position: newPosition };

        // Constrain to container and adapt size dynamically
        const container = containerMeshesRef.current[0];
        if (container) {
          // First adapt the zone to container shape at new position
          updatedZone = adaptZoneToContainer(updatedZone, container);
          // Then constrain position to stay within bounds
          updatedZone = constrainToContainer(updatedZone, container);
          // Update mesh position
          event.object.position.set(...updatedZone.position);

          // Update mesh size if it changed during adaptation
          if (
            event.object.geometry.parameters.width !== updatedZone.size.width ||
            event.object.geometry.parameters.height !==
              updatedZone.size.height ||
            event.object.geometry.parameters.depth !== updatedZone.size.depth
          ) {
            event.object.geometry.dispose();
            event.object.geometry = new THREE.BoxGeometry(
              updatedZone.size.width,
              updatedZone.size.height,
              updatedZone.size.depth
            );
            // Update edges
            const edgeLines = event.object.children.find(
              (child) => child.isLineSegments
            );
            if (edgeLines) {
              edgeLines.geometry.dispose();
              edgeLines.geometry = new THREE.EdgesGeometry(
                event.object.geometry
              );
            }
          }
        }
      });

      dragControls.addEventListener("dragend", (event) => {
        isDraggingRef.current = false;
        orbitControlsRef.current.enabled = true;

        const zoneId = event.object.userData.zoneId;
        const zone = zones.find((z) => z.id === zoneId);
        if (!zone) return;

        // Get final position with validation
        const newPosition = [
          isNaN(event.object.position.x) ? 0 : event.object.position.x,
          isNaN(event.object.position.y) ? 0 : event.object.position.y,
          isNaN(event.object.position.z) ? 0 : event.object.position.z,
        ];

        let finalZone = { ...zone, position: newPosition };

        // Adapt to container at final position
        const container = containerMeshesRef.current[0];
        if (container) {
          finalZone = adaptZoneToContainer(finalZone, container);
          finalZone = constrainToContainer(finalZone, container);
        }

        // Update zone
        const updatedZones = zones.map((z) =>
          z.id === zoneId ? finalZone : z
        );

        // Resolve collisions
        const resolvedZones = resolveZoneCollisions(updatedZones);
        onZonesChange(resolvedZones);
      });

      dragControlsRef.current = dragControls;
    }
  }, [zones, selectedZoneId, onZonesChange, onSelectZone]);

  // Setup Transform Controls for selected zone
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    // Remove old transform controls
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
      sceneRef.current.remove(transformControlsRef.current);
      transformControlsRef.current.dispose();
      transformControlsRef.current = null;
    }

    // Create new transform controls if zone is selected
    if (selectedZoneId) {
      const zoneMesh = zoneMeshesRef.current.get(selectedZoneId);
      if (zoneMesh) {
        const transformControls = new TransformControls(
          cameraRef.current,
          rendererRef.current.domElement
        );

        transformControls.setMode(transformMode);
        transformControls.setSize(0.8);
        transformControls.setSpace("world");

        // Disable orbit controls during transform
        transformControls.addEventListener("dragging-changed", (event) => {
          if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = !event.value;
          }
          if (dragControlsRef.current) {
            dragControlsRef.current.enabled = !event.value;
          }
        });

        // Handle transform changes
        transformControls.addEventListener("objectChange", () => {
          const zone = zones.find((z) => z.id === selectedZoneId);
          if (!zone || !zoneMesh) return;

          // Get updated transform
          const position = [
            isNaN(zoneMesh.position.x) ? 0 : zoneMesh.position.x,
            isNaN(zoneMesh.position.y) ? 0 : zoneMesh.position.y,
            isNaN(zoneMesh.position.z) ? 0 : zoneMesh.position.z,
          ];
          const rotation = [
            zoneMesh.rotation.x,
            zoneMesh.rotation.y,
            zoneMesh.rotation.z,
          ];
          const scale = [zoneMesh.scale.x, zoneMesh.scale.y, zoneMesh.scale.z];

          let updatedZone = {
            ...zone,
            position,
            rotation,
            size: {
              width: zone.size.width * scale[0],
              height: zone.size.height * scale[1],
              depth: zone.size.depth * scale[2],
            },
          };

          // Apply constraints
          const container = containerMeshesRef.current[0];
          if (container) {
            updatedZone = constrainToContainer(updatedZone, container);
            // Update mesh to match constrained position
            zoneMesh.position.set(...updatedZone.position);
          }

          // Check for collisions with other zones
          const otherZones = zones.filter((z) => z.id !== selectedZoneId);
          let hasCollision = false;
          for (const other of otherZones) {
            if (zonesOverlap(updatedZone, other)) {
              hasCollision = true;
              break;
            }
          }

          // Update zone if no collision
          if (!hasCollision) {
            const updatedZones = zones.map((z) =>
              z.id === selectedZoneId ? updatedZone : z
            );
            onZonesChange(updatedZones);
          }
        });

        transformControls.attach(zoneMesh);
        sceneRef.current.add(transformControls);
        transformControlsRef.current = transformControls;
      }
    }

    return () => {
      if (transformControlsRef.current) {
        transformControlsRef.current.detach();
        sceneRef.current.remove(transformControlsRef.current);
        transformControlsRef.current.dispose();
        transformControlsRef.current = null;
      }
    };
  }, [selectedZoneId, transformMode, zones, onZonesChange]);

  // Update transform mode when changed
  const handleTransformModeChange = useCallback((newMode) => {
    setTransformMode(newMode);
    if (transformControlsRef.current) {
      transformControlsRef.current.setMode(newMode);
    }
  }, []);

  // Handle delete selected zone
  const handleDeleteZone = useCallback(() => {
    if (selectedZoneId) {
      const updatedZones = zones.filter((z) => z.id !== selectedZoneId);
      onZonesChange(updatedZones);
      onSelectZone(null);
    }
  }, [selectedZoneId, zones, onZonesChange, onSelectZone]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedZoneId) return;

      switch (e.key.toLowerCase()) {
        case "g":
          handleTransformModeChange("translate");
          break;
        case "r":
          handleTransformModeChange("rotate");
          break;
        case "s":
          handleTransformModeChange("scale");
          break;
        case "delete":
        case "backspace":
          handleDeleteZone();
          break;
        case "escape":
          onSelectZone(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedZoneId,
    handleTransformModeChange,
    handleDeleteZone,
    onSelectZone,
  ]);

  // Handle drag over viewport
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // Handle drop zone into viewport
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();

      const zoneType = e.dataTransfer.getData("zone-type");
      if (!zoneType) return;

      // Calculate 3D position from drop location
      const rect = mountRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

      // Raycast to find drop position
      let dropPosition = [0, 0, 0];

      // First try to hit a container
      const containerIntersects = raycaster.intersectObjects(
        containerMeshesRef.current,
        true
      );

      if (containerIntersects.length > 0) {
        const point = containerIntersects[0].point;
        dropPosition = [
          isNaN(point.x) ? 0 : point.x,
          isNaN(point.y) ? 0 : point.y,
          isNaN(point.z) ? 0 : point.z,
        ];
      } else {
        // Drop on grid
        const gridPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(gridPlane, intersection);
        dropPosition = [
          isNaN(intersection.x) ? 0 : intersection.x,
          isNaN(intersection.y) ? 0 : intersection.y,
          isNaN(intersection.z) ? 0 : intersection.z,
        ];
      }

      // Create new zone with validated position
      const newZone = createFunctionalZone(zoneType, dropPosition);
      if (!newZone) return;

      // Adapt to container if available
      const container = containerMeshesRef.current[0];
      if (container) {
        // Adapt zone size to fit container
        const adaptedZone = adaptZoneToContainer(newZone, container);
        // Constrain position to stay within container
        const constrainedZone = constrainToContainer(adaptedZone, container);
        // Add to zones list
        const updatedZones = [...zones, constrainedZone];
        // Resolve any collisions
        const resolvedZones = resolveZoneCollisions(updatedZones);
        onZonesChange(resolvedZones);
      } else {
        onZonesChange([...zones, newZone]);
      }

      setDraggedZoneType(null);

      if (onDropZone) {
        onDropZone(newZone);
      }
    },
    [zones, onZonesChange, onDropZone]
  );

  // Handle click to select zone
  const handleClick = useCallback(
    (e) => {
      if (isDraggingRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

      const zoneMeshes = Array.from(zoneMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(zoneMeshes, true);

      if (intersects.length > 0) {
        const zoneId =
          intersects[0].object.userData.zoneId ||
          intersects[0].object.parent?.userData?.zoneId;
        if (zoneId) {
          onSelectZone(zoneId);
        }
      } else {
        onSelectZone(null);
      }
    },
    [onSelectZone]
  );

  return (
    <div
      ref={mountRef}
      className="zone-viewport"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        cursor: isDraggingRef.current ? "grabbing" : "default",
      }}
    >
      {/* Info overlay */}
      <div className="zone-viewport-info">
        <div className="info-item">
          <span className="info-label">Zones:</span>
          <span className="info-value">{zones.length}</span>
        </div>
        {hoveredZone && (
          <div className="info-item">
            <span className="info-label">Hovered:</span>
            <span className="info-value">{hoveredZone.name}</span>
          </div>
        )}
      </div>

      {/* Drop hint when dragging */}
      {draggedZoneType && (
        <div className="drop-hint">
          <div className="drop-hint-icon"></div>
          <div className="drop-hint-text">
            Drop to place {draggedZoneType} zone
          </div>
        </div>
      )}

      {/* Transform Toolbar */}
      <ZoneTransformToolbar
        selectedZone={zones.find((z) => z.id === selectedZoneId)}
        transformMode={transformMode}
        onModeChange={handleTransformModeChange}
        onDelete={handleDeleteZone}
      />
    </div>
  );
}

ZoneViewport.propTypes = {
  exteriorObjects: PropTypes.array.isRequired,
  zones: PropTypes.array.isRequired,
  onZonesChange: PropTypes.func.isRequired,
  selectedZoneId: PropTypes.string,
  onSelectZone: PropTypes.func.isRequired,
  onDropZone: PropTypes.func,
};

export default ZoneViewport;
