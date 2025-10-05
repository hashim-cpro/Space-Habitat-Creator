# 🔗 Interior System Integration Guide

## Quick Integration (5 minutes)

### Option 1: Add Route to Main App

**1. Create Interior Route Page**

Create `src/pages/InteriorDesignPage.jsx`:

```jsx
import { useState } from "react";
import InteriorApp from "../interior/InteriorApp";

function InteriorDesignPage() {
  // In production, this would come from selected habitat module
  const [selectedHabitat] = useState({
    id: "habitat_001",
    radius: 7.5, // meters
    length: 20, // meters
  });

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <InteriorApp habitatModule={selectedHabitat} />
    </div>
  );
}

export default InteriorDesignPage;
```

**2. Add to Router** (if using React Router)

```jsx
// In your main App.jsx or router config
import InteriorDesignPage from "./pages/InteriorDesignPage";

// Add route
<Route path="/interior" element={<InteriorDesignPage />} />;
```

**3. Add Navigation Button**

```jsx
// In your main app toolbar
<button onClick={() => navigate("/interior")}>🏠 Design Interior</button>
```

---

### Option 2: Modal/Popup Integration

**Create Interior Modal Component:**

```jsx
import { useState } from "react";
import InteriorApp from "../interior/InteriorApp";

function InteriorDesignModal({ isOpen, onClose, habitatModule }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1a1a1a",
          borderBottom: "1px solid #333",
        }}
      >
        <h2 style={{ margin: 0, color: "#fff" }}>
          Interior Design - {habitatModule.id}
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: "8px 16px",
            backgroundColor: "#666",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          ✕ Close
        </button>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <InteriorApp habitatModule={habitatModule} />
      </div>
    </div>
  );
}

export default InteriorDesignModal;
```

**Usage:**

```jsx
// In your main app
const [showInterior, setShowInterior] = useState(false);
const [selectedHabitat, setSelectedHabitat] = useState(null);

// Button to open
<button onClick={() => {
  setSelectedHabitat(currentHabitat);
  setShowInterior(true);
}}>
  🏠 Design Interior
</button>

// Modal
<InteriorDesignModal
  isOpen={showInterior}
  onClose={() => setShowInterior(false)}
  habitatModule={selectedHabitat}
/>
```

---

### Option 3: Standalone Testing Page (Fastest)

**Create `src/TestInterior.jsx`:**

```jsx
import InteriorApp from "./interior/InteriorApp";
import "./index.css";

function TestInterior() {
  const testHabitat = {
    id: "test_hab_001",
    radius: 7.5,
    length: 20,
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <InteriorApp habitatModule={testHabitat} />
    </div>
  );
}

export default TestInterior;
```

**Temporarily modify `src/main.jsx`:**

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TestInterior from "./TestInterior"; // Add this
// import App from './App'; // Comment out temporarily
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TestInterior /> {/* Use this for testing */}
    {/* <App /> */}
  </StrictMode>
);
```

**Then run:**

```bash
npm run dev
```

**Navigate to:** http://localhost:5173

---

## Data Flow Between Systems

### Exterior → Interior

The exterior CAD system passes habitat specifications:

```javascript
// When user clicks "Design Interior" on a habitat module
const habitatData = {
  id: objectId, // Unique identifier
  radius: cylinderRadius, // In meters
  length: cylinderLength, // In meters
  // Optional:
  wallThickness: 0.1, // For usable interior radius
  type: "habitat", // Module type
  position: [x, y, z], // 3D position (optional)
};

// Launch interior design
<InteriorApp habitatModule={habitatData} />;
```

### Interior → Exterior

The interior system returns design data:

```javascript
// Interior design completion callback
onDesignComplete={(interiorConfig) => {
  // Save interior config to habitat module
  habitatModules[habitatId].interior = interiorConfig;

  // Interior config contains:
  // - decks: [{id, level, rooms: [...]}]
  // - totalArea: number
  // - crewSize: number
  // - validation: {score, errors, warnings}
}}
```

---

## Full Integration Example

**Modify your main App to add interior design:**

```jsx
import { useState } from "react";
import App from "./App";
import InteriorApp from "./interior/InteriorApp";

function MainApp() {
  const [currentView, setCurrentView] = useState("exterior"); // 'exterior' or 'interior'
  const [selectedModule, setSelectedModule] = useState(null);
  const [modules, setModules] = useState({});

  // When user selects module and clicks "Design Interior"
  const handleDesignInterior = (moduleId, moduleData) => {
    setSelectedModule({
      id: moduleId,
      radius: moduleData.radius,
      length: moduleData.length,
    });
    setCurrentView("interior");
  };

  // Save interior design back to module
  const handleSaveInterior = (interiorConfig) => {
    setModules((prev) => ({
      ...prev,
      [selectedModule.id]: {
        ...prev[selectedModule.id],
        interior: interiorConfig,
      },
    }));
    setCurrentView("exterior");
  };

  if (currentView === "interior" && selectedModule) {
    return (
      <div style={{ width: "100vw", height: "100vh" }}>
        <div
          style={{ padding: "10px", backgroundColor: "#1a1a1a", color: "#fff" }}
        >
          <button onClick={() => setCurrentView("exterior")}>
            ← Back to Exterior Design
          </button>
        </div>
        <InteriorApp
          habitatModule={selectedModule}
          onSave={handleSaveInterior}
        />
      </div>
    );
  }

  return <App onDesignInterior={handleDesignInterior} modules={modules} />;
}

export default MainApp;
```

---

## Testing Checklist

### ✅ Pre-Integration Tests

1. **Standalone Test:**
   - [ ] Create TestInterior.jsx
   - [ ] Run `npm run dev`
   - [ ] Verify interior app loads
   - [ ] Add rooms from library
   - [ ] Check validation works
   - [ ] Test both 2D views

### ✅ Integration Tests

2. **Data Flow:**

   - [ ] Pass habitat data from exterior
   - [ ] Verify radius/length display correctly
   - [ ] Save interior config
   - [ ] Load saved config
   - [ ] Switch between modules

3. **UI Integration:**

   - [ ] Navigation works (back/forward)
   - [ ] Modal opens/closes properly
   - [ ] No style conflicts
   - [ ] Responsive on different screens

4. **Performance:**
   - [ ] No lag when switching views
   - [ ] Canvas renders smoothly
   - [ ] Validation doesn't freeze UI
   - [ ] Memory doesn't leak on re-renders

---

## Common Integration Issues

### Issue 1: Habitat Data Missing

**Symptom:** Interior app shows errors or defaults

**Solution:**

```jsx
// Ensure habitat data is complete
const habitatData = {
  id: moduleId || "unknown",
  radius: radius || 7.5,
  length: length || 20,
};

// Add validation
if (!habitatData.id || !habitatData.radius || !habitatData.length) {
  console.error("Invalid habitat data:", habitatData);
  return <div>Error: Invalid habitat module</div>;
}
```

### Issue 2: CSS Conflicts

**Symptom:** Styling looks broken

**Solution:**

```jsx
// Wrap interior in isolated div
<div className="interior-design-container" style={{ isolation: "isolate" }}>
  <InteriorApp habitatModule={habitatData} />
</div>
```

### Issue 3: Canvas Not Rendering

**Symptom:** Blank canvas area

**Solution:**

```jsx
// Ensure parent has defined size
<div style={{ width: "100%", height: "100%" }}>
  <InteriorApp habitatModule={habitatData} />
</div>

// Check browser console for errors
// Verify canvas element exists in DOM
```

### Issue 4: State Not Persisting

**Symptom:** Changes lost when switching views

**Solution:**

```jsx
// Use state management or localStorage
import { useEffect } from "react";

function InteriorDesignPage({ habitatModule }) {
  useEffect(() => {
    // Auto-save every 3 seconds
    const interval = setInterval(() => {
      const state = getInteriorState();
      localStorage.setItem(
        `interior_${habitatModule.id}`,
        JSON.stringify(state)
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [habitatModule.id]);

  // ... rest of component
}
```

---

## Data Persistence Example

**Save/Load Interior Designs:**

```javascript
// Save to localStorage
const saveInteriorDesign = (habitatId, interiorConfig) => {
  const key = `interior_design_${habitatId}`;
  localStorage.setItem(key, JSON.stringify(interiorConfig));
};

// Load from localStorage
const loadInteriorDesign = (habitatId) => {
  const key = `interior_design_${habitatId}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
};

// In InteriorApp.jsx, add auto-save
useEffect(() => {
  const saveInterval = setInterval(() => {
    saveInteriorDesign(habitatModule.id, interiorConfig);
  }, 3000); // Auto-save every 3 seconds

  return () => clearInterval(saveInterval);
}, [interiorConfig, habitatModule.id]);

// Load on mount
useEffect(() => {
  const savedConfig = loadInteriorDesign(habitatModule.id);
  if (savedConfig) {
    setInteriorConfig(savedConfig);
  }
}, [habitatModule.id]);
```

---

## Next Steps After Integration

1. **User Testing**

   - Follow `INTERIOR_TESTING_GUIDE.md`
   - Test all 40+ checklist items
   - Gather feedback

2. **Data Integration**

   - Connect to project storage system
   - Implement save/load/export
   - Add version control

3. **UI Polish**

   - Match design language of exterior system
   - Add loading states
   - Improve error handling

4. **Phase 2 Features**
   - Start 3D interior rendering
   - Add furniture system
   - Implement advanced features

---

## Example: Full Project Structure

```
habitat-creator/
├── src/
│   ├── App.jsx                    # Main exterior CAD
│   ├── interior/                  # ← NEW SYSTEM (isolated)
│   │   ├── InteriorApp.jsx
│   │   ├── components/...
│   │   ├── utils/...
│   │   └── data/...
│   ├── pages/                     # ← ADD THIS
│   │   ├── InteriorDesignPage.jsx # Route for interior
│   │   └── ExteriorCADPage.jsx    # Existing exterior
│   ├── components/                # Exterior components
│   └── utils/                     # Exterior utilities
├── INTERIOR_QUICK_START.md        # Start here
├── INTERIOR_TESTING_GUIDE.md      # Testing instructions
└── INTERIOR_INTEGRATION_GUIDE.md  # This file
```

---

## Support & Documentation

- **Quick Start:** `INTERIOR_QUICK_START.md`
- **Testing:** `INTERIOR_TESTING_GUIDE.md`
- **Architecture:** `INTERIOR_DESIGN_ARCHITECTURE.md`
- **Technical Docs:** `src/interior/README.md`
- **Summary:** `INTERIOR_IMPLEMENTATION_SUMMARY.md`

---

## 🚀 Ready to Launch!

Choose integration option above and start testing.

**Recommended Order:**

1. Option 3 (Standalone) - Test basic functionality
2. Option 1 (Route) - Production integration
3. Option 2 (Modal) - Alternative if needed

---

**Time to complete integration:** 5-10 minutes  
**Prerequisites:** None (all dependencies already installed)  
**Risk level:** Low (completely isolated system)

🎉 **Happy Integrating!** 🎉
