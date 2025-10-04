# 🧪 Testing Guide - New Features

## Quick Test Checklist

### ✅ Landing Page & Project Management

**Test 1: Create First Project**

1. Open the app → Should see landing page
2. Click "Create First Project" or "+ New Project"
3. Enter name "Test Project 1"
4. Click Create
5. ✓ Should open editor with empty scene

**Test 2: Auto-Save**

1. In editor, import a GLB/STL file
2. Wait 3 seconds
3. Check console (F12) → Should see "✓ Project saved: Test Project 1"
4. ✓ Auto-save working

**Test 3: Manual Save**

1. Make a change (move an object)
2. Press Ctrl+S (Cmd+S on Mac)
3. Check console → Should see save confirmation
4. ✓ Manual save working

**Test 4: Return Home**

1. Click "← Home" button in header
2. ✓ Should see landing page with "Test Project 1" card
3. ✓ Card should show object count and last modified date

**Test 5: Reopen Project**

1. Click on "Test Project 1" card
2. ✓ Should open with all objects intact
3. ✓ All transforms and materials preserved

**Test 6: Create Multiple Projects**

1. Click "← Home"
2. Create "Test Project 2"
3. Import different files
4. Go home again
5. ✓ Should see both projects in grid

**Test 7: Delete Project**

1. On landing page, hover over a project card
2. Click X button in top-right
3. Confirm deletion
4. ✓ Project should disappear from grid
5. ✓ Other projects remain intact

### ✅ Touch Gestures (iPad/Tablet)

**Test 8: One Finger Rotate**

1. Open project on iPad
2. Drag with ONE finger on canvas
3. ✓ Camera should rotate around scene
4. ✓ Smooth, natural rotation

**Test 9: Two Finger Pan**

1. Drag with TWO fingers on canvas
2. ✓ Camera should pan/move left/right/up/down
3. ✓ No rotation, just translation

**Test 10: Pinch to Zoom**

1. Place two fingers on canvas
2. Pinch together → ✓ Zoom out
3. Spread apart → ✓ Zoom in
4. ✓ Smooth zoom without jumping

**Test 11: Combined Gestures**

1. Rotate with one finger
2. Switch to two fingers for pan (without lifting)
3. Pinch to zoom
4. ✓ All gestures work seamlessly together

**Test 12: Touch Targets**

1. Try tapping toolbar buttons
2. Try tapping header buttons
3. ✓ All buttons should be easy to hit (44px minimum)
4. ✓ No accidental misclicks

### ✅ Responsive Design

**Test 13: Desktop View**

1. Open on desktop browser
2. ✓ Full width layout
3. ✓ All panels visible
4. ✓ No horizontal scroll

**Test 14: Tablet Portrait**

1. Rotate iPad to portrait
2. ✓ UI adapts
3. ✓ Buttons remain accessible
4. ✓ Properties drawer works

**Test 15: Tablet Landscape**

1. Rotate iPad to landscape
2. ✓ Optimal layout
3. ✓ More canvas space
4. ✓ Panels positioned correctly

**Test 16: Mobile Phone**

1. Open on phone
2. ✓ Toolbar narrower
3. ✓ Properties drawer full width
4. ✓ Text readable
5. ✓ All functions accessible

### ✅ Data Persistence

**Test 17: Page Reload**

1. Create project with objects
2. Refresh page (F5)
3. ✓ Should auto-open last project
4. ✓ All data intact

**Test 18: Browser Close/Reopen**

1. Close browser completely
2. Reopen and navigate to app
3. ✓ Landing page shows all projects
4. ✓ Can reopen any project

**Test 19: LocalStorage Check**

1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Find keys: `habitat-projects`, `habitat-current-project`
4. ✓ Data stored as JSON
5. ✓ Project structure matches schema

**Test 20: Storage Limits**

1. Create multiple projects
2. Import large files
3. ✓ No errors until ~5MB used
4. ✓ Graceful handling if limit reached

## 🐛 Known Issues to Test

### Potential Edge Cases

1. **Import while auto-saving**

   - Import file immediately after another import
   - Should: Queue save, not interfere

2. **Delete current project**

   - Delete the project you're currently editing
   - Expected: Should redirect to landing page

3. **Multiple browser tabs**

   - Open app in two tabs
   - Edit in both
   - Expected: Last save wins (no conflict resolution yet)

4. **Very large geometries**

   - Import file with 500k+ triangles
   - Expected: Warning in console, but should work

5. **Rapid gesture switching**
   - Quickly switch between 1, 2, 3 fingers
   - Expected: Smooth transitions, no crashes

## 📊 Performance Benchmarks

### Target Performance

- Landing page load: < 500ms
- Project open: < 1 second
- Auto-save: < 100ms
- Touch response: < 16ms (60 FPS)
- Gesture recognition: Immediate

### Test Commands

```javascript
// In browser console:

// Check storage usage
console.log(JSON.stringify(localStorage).length / (1024 * 1024) + " MB");

// Count projects
console.log(
  JSON.parse(localStorage.getItem("habitat-projects")).length + " projects"
);

// View current project
console.log(JSON.parse(localStorage.getItem("habitat-current-project")));

// Clear all data (careful!)
// localStorage.clear();
```

## ✅ Success Criteria

All features pass when:

- [ ] Can create, open, delete projects
- [ ] Auto-save works reliably
- [ ] All touch gestures work on iPad
- [ ] Responsive on all device sizes
- [ ] Data persists across sessions
- [ ] No console errors
- [ ] Smooth 60 FPS on canvas
- [ ] Export functions still work
- [ ] Undo/redo history intact

---

**Test Environment**:

- Desktop: Chrome 120+, Firefox 120+, Safari 17+
- Tablet: iPad (iOS 16+), Android tablets
- Mobile: iPhone 12+, Android phones

**Test Duration**: ~30 minutes for full suite
