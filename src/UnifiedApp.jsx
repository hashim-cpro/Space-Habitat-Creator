import { useState, useMemo, useEffect } from "react";
import App from "./App";
import InteriorApp from "./interior/InteriorApp";
import "./App.css";

function UnifiedApp() {
  const [mode, setMode] = useState("exterior"); // 'exterior' or 'interior'
  const [selectedHabitat, setSelectedHabitat] = useState(null);
  const [habitatModules, setHabitatModules] = useState({});
  const [exteriorObjects, setExteriorObjects] = useState([]);

  // Load exterior objects from localStorage
  useEffect(() => {
    const loadExteriorObjects = () => {
      const savedData = localStorage.getItem("habitat-creator-exterior");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.objects && Array.isArray(parsed.objects)) {
            setExteriorObjects(parsed.objects);
          }
        } catch (error) {
          console.error("Failed to load exterior objects:", error);
        }
      }
    };

    // Load initially
    loadExteriorObjects();

    // Poll for changes when in interior mode
    const interval = setInterval(() => {
      if (mode === "interior") {
        loadExteriorObjects();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  // Extract habitat modules from exterior objects
  const availableHabitats = useMemo(() => {
    const habitats = exteriorObjects
      .filter((obj) => {
        // Check if object is a cylindrical habitat module
        const isCylinder =
          obj.type === "cylinder" ||
          obj.moduleType === "habitat" ||
          obj.moduleType === "cylindrical-habitat" ||
          (obj.geometry && obj.geometry.type === "cylinder");

        // Must have valid dimensions
        const hasValidDimensions =
          obj.parameters &&
          obj.parameters.radius > 0 &&
          obj.parameters.height > 0;

        return isCylinder && hasValidDimensions;
      })
      .map((obj) => ({
        id: obj.id,
        name: obj.name || `Habitat ${obj.id}`,
        radius: obj.parameters.radius,
        length: obj.parameters.height, // height is length for cylinders
        position: obj.position,
        rotation: obj.rotation,
        moduleType: obj.moduleType || "habitat",
      }));

    // If no habitats found, create a default one for testing
    if (habitats.length === 0) {
      return [
        {
          id: "default_habitat",
          name: "Default Test Habitat",
          radius: 7.5,
          length: 20,
          position: [0, 0, 0],
          moduleType: "habitat",
        },
      ];
    }

    return habitats;
  }, [exteriorObjects]);

  // Select first habitat by default
  const currentHabitat = selectedHabitat || availableHabitats[0];

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    if (
      newMode === "interior" &&
      !selectedHabitat &&
      availableHabitats.length > 0
    ) {
      setSelectedHabitat(availableHabitats[0]);
    }
  };

  const handleSaveInterior = (interiorConfig) => {
    if (currentHabitat) {
      setHabitatModules((prev) => ({
        ...prev,
        [currentHabitat.id]: {
          ...prev[currentHabitat.id],
          interior: interiorConfig,
        },
      }));
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Mode Switch Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "30px",
          justifyContent: "space-between",
          padding: "10px 20px",
          borderBottom: "2px solid #333",
          zIndex: 1000,
          position: "fixed",
          top: "65px",
          right: "7px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* <h2 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>
            🚀 Habitat Creator
          </h2> */}
          {mode === "interior" && currentHabitat && (
            <span
              style={{
                color: "#888",
                fontSize: "14px",
                marginLeft: "10px",
              }}
            >
              → Interior: {currentHabitat.name} ({currentHabitat.radius}m ×{" "}
              {currentHabitat.length}m)
            </span>
          )}
          {mode === "exterior" && exteriorObjects.length > 0 && (
            <span
              style={{
                color: "#4a9eff",
                fontSize: "12px",
                marginLeft: "10px",
                backgroundColor: "#1e3a5f",
                padding: "4px 8px",
                borderRadius: "4px",
              }}
            >
              {exteriorObjects.length} objects | {availableHabitats.length}{" "}
              habitat{availableHabitats.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "5px",
            backgroundColor: "#2a2a2a",
            borderRadius: "8px",
            padding: "5px",
          }}
        >
          <button
            onClick={() => handleSwitchMode("exterior")}
            style={{
              padding: "10px 20px",
              backgroundColor: mode === "exterior" ? "#007acc" : "transparent",
              color: mode === "exterior" ? "#fff" : "#aaa",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: mode === "exterior" ? "bold" : "normal",
              fontSize: "14px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🏗️ <span>Exterior Design</span>
          </button>

          <button
            onClick={() => handleSwitchMode("interior")}
            style={{
              padding: "10px 20px",
              backgroundColor: mode === "interior" ? "#007acc" : "transparent",
              color: mode === "interior" ? "#fff" : "#aaa",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: mode === "interior" ? "bold" : "normal",
              fontSize: "14px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🏠 <span>Interior Design</span>
          </button>
        </div>

        {mode === "interior" && availableHabitats.length > 1 && (
          <select
            value={currentHabitat?.id || ""}
            onChange={(e) => {
              const habitat = availableHabitats.find(
                (h) => h.id === e.target.value
              );
              setSelectedHabitat(habitat);
            }}
            style={{
              padding: "8px 12px",
              backgroundColor: "#2a2a2a",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {availableHabitats.map((habitat) => (
              <option key={habitat.id} value={habitat.id}>
                {habitat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {mode === "exterior" ? (
          <App />
        ) : currentHabitat ? (
          <InteriorApp
            habitatModule={currentHabitat}
            onSave={handleSaveInterior}
            initialConfig={habitatModules[currentHabitat.id]?.interior}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#888",
              gap: "20px",
            }}
          >
            <h2>No Habitat Modules Available</h2>
            <p>Create a habitat module in Exterior Design mode first.</p>
            <button
              onClick={() => handleSwitchMode("exterior")}
              style={{
                padding: "12px 24px",
                backgroundColor: "#007acc",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Go to Exterior Design
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnifiedApp;
