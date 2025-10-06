/**
 * Interior Design App - Functional Zones Editor
 */

import { useEffect, useState } from "react";
import * as ModuleGenerators from "../utils/moduleGenerators";
import ZonePalette from "./components/ZonePalette";
import ZoneViewport from "./components/ZoneViewport";
import ZonePropertiesPanel from "./components/ZonePropertiesPanel";
import "./InteriorApp.css";

// Helper function to recreate geometry from parameters
function recreateGeometry(obj) {
  if (obj.type === "module" && obj.userData?.moduleDefinition) {
    const generatorFunc =
      ModuleGenerators[obj.userData.moduleDefinition.generator];
    if (generatorFunc) {
      const geometry = generatorFunc(obj.userData.parameters || obj.parameters);
      return {
        ...obj,
        geometry: geometry,
        parameters: obj.userData.parameters || obj.parameters,
        userData: {
          ...obj.userData,
          geometry: geometry,
        },
      };
    }
  }

  if (obj.type === "custom") {
    console.warn(
      `Cannot recreate custom/imported geometry for ${obj.name}. Object will be skipped.`
    );
    return null;
  }

  if (!obj.parameters) {
    console.warn(`Object ${obj.name} missing parameters, skipping`);
    return null;
  }

  return obj;
}

function InteriorApp() {
  const [exteriorObjects, setExteriorObjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  // Load exterior objects from localStorage
  useEffect(() => {
    const loadExteriorObjects = () => {
      const savedData = localStorage.getItem("habitat-creator-exterior");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.objects && Array.isArray(parsed.objects)) {
            const objectsWithGeometry = parsed.objects
              .map((obj) => recreateGeometry(obj))
              .filter((obj) => obj !== null);
            setExteriorObjects(objectsWithGeometry);
          }
        } catch (error) {
          console.error("Failed to load exterior objects:", error);
        }
      }
    };

    loadExteriorObjects();
    const interval = setInterval(loadExteriorObjects, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load zones from localStorage
  useEffect(() => {
    const savedZones = localStorage.getItem("habitat-creator-zones");
    if (savedZones) {
      try {
        const parsed = JSON.parse(savedZones);
        setZones(parsed);
      } catch (error) {
        console.error("Failed to load zones:", error);
      }
    }
  }, []);

  // Save zones to localStorage
  useEffect(() => {
    if (zones.length > 0) {
      localStorage.setItem("habitat-creator-zones", JSON.stringify(zones));
    }
  }, [zones]);

  const handleZonesChange = (newZones) => {
    setZones(newZones);
  };

  const handleSelectZone = (zoneId) => {
    setSelectedZoneId(zoneId);
  };

  const handleUpdateZone = (updatedZone) => {
    setZones((prev) =>
      prev.map((zone) => (zone.id === updatedZone.id ? updatedZone : zone))
    );
  };

  const handleDeleteZone = (zoneId) => {
    setZones((prev) => prev.filter((zone) => zone.id !== zoneId));
    if (selectedZoneId === zoneId) {
      setSelectedZoneId(null);
    }
  };

  const selectedZone = zones.find((z) => z.id === selectedZoneId);

  return (
    <div className="interior-app">
      {/* Left Panel - Zone Palette */}
      <div className="interior-panel left-panel">
        <ZonePalette disabled={false} />
      </div>

      {/* Center - 3D Viewport */}
      <div className="interior-main">
        <div className="interior-header">
          <h2>Interior Functional Zones</h2>
          <div className="header-info">
            <span className="info-badge">
              {exteriorObjects.length} Container
              {exteriorObjects.length !== 1 ? "s" : ""}
            </span>
            <span className="info-badge">
              {zones.length} Zone{zones.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <ZoneViewport
          exteriorObjects={exteriorObjects}
          zones={zones}
          onZonesChange={handleZonesChange}
          selectedZoneId={selectedZoneId}
          onSelectZone={handleSelectZone}
        />
      </div>

      {/* Right Panel - Properties */}
      <div className="interior-panel right-panel">
        <ZonePropertiesPanel
          zone={selectedZone}
          onUpdateZone={handleUpdateZone}
          onDeleteZone={handleDeleteZone}
        />
      </div>
    </div>
  );
}

export default InteriorApp;
