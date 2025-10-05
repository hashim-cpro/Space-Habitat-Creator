# 🏠 Interior Design System - Testing Instructions

## How to Test the Interior Design System

### Option 1: Standalone Test Page (Recommended)

Create a new test page in your project:

```bash
# Create test file
touch src/interior/InteriorTestPage.jsx
```

**`src/interior/InteriorTestPage.jsx`:**

```javascript
import InteriorApp from "./InteriorApp";

function InteriorTestPage() {
  // Test data - replace with real habitat module from exterior system
  const testHabitatModule = {
    id: "test_habitat_001",
    name: "Test Habitat Module",
    radius: 7.5, // meters
    length: 20, // meters
    type: "cylinder",
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <InteriorApp habitatModule={testHabitatModule} />
    </div>
  );
}

export default InteriorTestPage;
```

### Option 2: Add Route to Main App

If using React Router:

```javascript
// In your main App.jsx or router config
import InteriorTestPage from "./interior/InteriorTestPage";

// Add route
<Route path="/interior" element={<InteriorTestPage />} />;
```

Then visit: `http://localhost:5173/interior`

### Option 3: Replace Landing Page Temporarily

```javascript
// In src/main.jsx, temporarily replace the app:
import InteriorTestPage from "./interior/InteriorTestPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <InteriorTestPage />
  </React.StrictMode>
);
```

---

## Testing Checklist

### ✅ Basic Functionality

- [ ] App loads without errors
- [ ] Default deck created automatically
- [ ] Crew size adjustable (1-50)
- [ ] Statistics display correctly

### ✅ Deck Management

- [ ] Can add new deck
- [ ] Can select different decks
- [ ] Can delete deck (with confirmation)
- [ ] Max deck limit enforced

### ✅ Room Placement

- [ ] Room library displays all room types
- [ ] Can filter by category
- [ ] Search works
- [ ] Clicking room adds it to active deck
- [ ] Room appears in viewport

### ✅ 2D Viewport - Polar View

- [ ] Circular habitat outline visible
- [ ] Rooms render as pie slices
- [ ] Angle markers (0°, 90°, 180°, 270°) shown
- [ ] Hover highlights rooms
- [ ] Click selects room
- [ ] Right-click deletes room (with confirm)

### ✅ 2D Viewport - Unwrapped View

- [ ] Rectangular viewport
- [ ] Grid lines visible
- [ ] Rooms render as rectangles
- [ ] Angle labels correct

### ✅ 3D Viewport

- [ ] Scene loads
- [ ] Cylinder visible
- [ ] "Coming in Phase 2" message shown
- [ ] Can orbit camera

### ✅ Validation

- [ ] Validation panel shows status
- [ ] Errors display for missing critical rooms
- [ ] Warnings display for recommendations
- [ ] Design score calculates (0-100)
- [ ] Score updates when rooms added/removed

### ✅ Statistics

- [ ] Total rooms count correct
- [ ] Total area calculates
- [ ] Space per crew updates
- [ ] Utilization percentage shows

---

## Expected Behavior

### On First Load

- 1 deck created automatically
- 0 rooms
- Validation shows: "Missing critical spaces"
- Design score: ~0-20
- Status: Invalid (red)

### After Adding Critical Rooms

- All 6 critical room types added (sleep, hygiene, galley, work, lifesupport, storage)
- Design score: 60-80
- Status: Good (green/yellow)

### With Optimal Layout

- All recommended rooms for crew size
- Proper adjacencies
- Good space utilization (40-70%)
- Design score: 80-100
- Status: Excellent (green)

---

## Common Issues & Fixes

### Issue: "Cannot read property 'decks' of null"

**Fix:** Ensure `habitatModule` prop is passed to `InteriorApp`

### Issue: Canvas not rendering

**Fix:** Check console for errors, ensure Three.js is installed

### Issue: Rooms not appearing

**Fix:**

- Check active deck is selected (highlighted in left sidebar)
- Verify room was added (check deck info shows room count)
- Try switching view modes

### Issue: Validation always shows errors

**Fix:** This is correct! Add rooms to fix validation errors.

### Issue: PropTypes warnings

**Fix:** These are safe to ignore during development

---

## Manual Test Cases

### Test Case 1: Basic Room Addition

1. Start app
2. Click "🛏️ Sleep Quarters" in room library
3. **Expected:** Room appears in polar view, stats update
4. **Pass:** ✅ Room visible, total rooms = 1

### Test Case 2: Multi-Deck

1. Click "➕ Add Deck"
2. Select Deck 2
3. Add a room
4. Switch back to Deck 1
5. **Expected:** Different rooms on each deck
6. **Pass:** ✅ Rooms stay on correct deck

### Test Case 3: Validation Flow

1. Set crew size to 6
2. Add 1 sleep room
3. **Expected:** Error "sleep: 7.5m² / 15m² required"
4. Add another sleep room
5. **Expected:** Error clears or reduces
6. **Pass:** ✅ Validation updates correctly

### Test Case 4: View Mode Switching

1. Add several rooms to a deck
2. Click "🎯 Polar View"
3. **Expected:** Circular layout
4. Click "📏 Unwrapped"
5. **Expected:** Rectangular layout, same rooms
6. Click "🏠 3D Interior"
7. **Expected:** 3D scene with "Phase 2" message
8. **Pass:** ✅ All views work

---

## Performance Benchmarks

### Target Performance

- Initial load: < 1 second
- Room addition: < 100ms
- View switch: < 200ms
- Validation update: < 50ms

### Test with Large Designs

- Add 50+ rooms
- Switch views rapidly
- **Expected:** No lag or freezing

---

## Browser Testing

Tested on:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

---

## Integration Testing (Future)

When integrating with exterior system:

1. **Data Flow Test**
   - Exterior creates habitat module
   - Pass module data to InteriorApp
   - Interior reads radius/length correctly
2. **Save/Load Test**

   - Design interior
   - Save project
   - Reload project
   - Interior data persists

3. **Export Test**
   - Complete design
   - Export to JSON/GLB
   - Interior data included

---

## Debug Mode

Add this to test specific features:

```javascript
// In InteriorApp.jsx, add after state declarations:
useEffect(() => {
  console.log("Interior Config:", interiorConfig);
  console.log("Active Deck:", activeDeck);
  console.log("Validation:", validation);
}, [interiorConfig, activeDeck, validation]);
```

---

## Test Data Generator

Need quick test data? Add this:

```javascript
// Quick test: Add sample rooms automatically
const addSampleRooms = () => {
  const sampleRooms = ["sleep", "hygiene", "galley", "work", "exercise"];
  sampleRooms.forEach((roomType) => handleAddRoom(roomType));
};

// Call it on mount or via button:
<button onClick={addSampleRooms}>Add Sample Rooms</button>;
```

---

## Success Criteria

✅ **MVP Complete** when:

- [x] Can create multiple decks
- [x] Can add rooms from library
- [x] 2D polar view renders correctly
- [x] 2D unwrapped view works
- [x] Validation runs and displays
- [x] Statistics calculate correctly
- [x] No critical errors in console

🎉 **Ready for Demo!**

---

Need help? Check:

1. Browser console for errors
2. `src/interior/README.md` for docs
3. Validation panel for specific issues
