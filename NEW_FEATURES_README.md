# 🏗️ Habitat Creator - New Features

## ✨ What's New

### 1. **Project Management & LocalStorage**

- All projects are now automatically saved to browser localStorage
- Landing page shows all your existing projects with thumbnails
- Create, open, and delete projects from the home screen
- Auto-save every 3 seconds while editing
- Manual save with Ctrl+S / Cmd+S

### 2. **iPad Touch Gestures**

- **1 Finger**: Rotate the camera around the scene
- **2 Fingers**: Pan/move the camera view
- **Pinch**: Zoom in and out smoothly
- Optimized for iPad and other touch devices
- All gestures work simultaneously with mouse controls

### 3. **Responsive Design**

- Fully responsive from mobile to desktop
- Touch-friendly buttons (44px minimum touch targets)
- Adaptive layouts for portrait and landscape
- Optimized for tablets and iPads

## 🚀 Getting Started

### First Time Use

1. **Launch the app** - You'll see the landing page
2. **Click "New Project"** or "+ New Project" button
3. **Enter a project name** (or leave blank for "Untitled Project")
4. **Start creating!** Import GLB/STL files and build your habitat

### Working with Projects

#### Creating a Project

```
Landing Page → New Project Button → Enter Name → Create
```

#### Opening a Project

```
Landing Page → Click on any project card → Opens in editor
```

#### Deleting a Project

```
Landing Page → Hover over project → Click X button → Confirm
```

### Using the Editor

#### Navigation (Desktop)

- **Left Mouse**: Rotate
- **Right Mouse**: Pan
- **Scroll Wheel**: Zoom
- **Middle Mouse**: Quick rotate

#### Navigation (iPad/Touch)

- **1 Finger Drag**: Rotate camera
- **2 Finger Drag**: Pan camera
- **Pinch**: Zoom in/out

#### Keyboard Shortcuts

- `Ctrl+S` / `Cmd+S`: Manual save
- `Ctrl+Z`: Undo
- `Ctrl+Shift+Z` / `Ctrl+Y`: Redo
- `Delete` / `Backspace`: Delete selected objects
- `X`, `Y`, `Z`: Lock axis for transforms
- `Esc`: Clear axis lock

#### Saving

- **Auto-save**: Happens every 3 seconds
- **Manual save**: Use the Save button or Ctrl+S
- **Exit save**: Automatically saves when clicking "Home"

## 📱 Touch Device Tips

### iPad Optimization

1. Use Safari or Chrome for best performance
2. Two-finger gestures are precise - practice them!
3. Pinch zoom works naturally like in Photos app
4. Rotate with one finger, then switch to two for repositioning

### Mobile Phone

- UI adapts to smaller screens
- Toolbar becomes narrower
- Properties drawer takes full width when open
- All core features remain accessible

## 💾 Data Storage

### Where is data stored?

- **Browser LocalStorage**: All projects stored locally in your browser
- **No cloud sync**: Data stays on your device for privacy
- **Export projects**: Use JSON export to back up your work

### Storage Limits

- Most browsers allow ~5-10MB of localStorage
- Each project stores:
  - Object data (geometry references)
  - Transform data (position, rotation, scale)
  - Material properties
  - Project metadata

### Clearing Data

To clear all projects:

```javascript
// Open browser console (F12) and run:
localStorage.removeItem("habitat-projects");
localStorage.removeItem("habitat-current-project");
```

## 🎨 Project Features

### Landing Page

- Grid view of all projects
- Visual thumbnails (coming soon)
- Last modified timestamps
- Object count per project
- Quick delete with confirmation

### Editor Features

- Import GLB, GLTF, STL files
- Export to GLB, STL, JSON
- Transform tools (move, rotate, scale)
- Object visibility toggle
- Multi-object selection
- Undo/Redo history
- Grid and gizmo helpers

## 🔧 Technical Details

### New Files Added

```
src/
  utils/
    projectStorage.js      # LocalStorage management
    touchGestures.js       # iPad gesture handlers
  components/
    LandingPage.jsx        # Project management UI
    LandingPage.css        # Landing page styles
  AppWithLanding.jsx       # Main app router
```

### Storage Schema

```javascript
{
  id: "project_timestamp_random",
  name: "My Habitat",
  objects: [...],           // Array of 3D objects
  objectIdCounter: 5,       // Next available ID
  createdAt: "ISO date",
  updatedAt: "ISO date",
  thumbnail: null           // Future feature
}
```

### Touch Gesture Implementation

- Uses native touch events (touchstart, touchmove, touchend)
- Detects finger count to switch modes
- Calculates pinch distance for zoom
- Prevents default scrolling during gestures
- Works alongside OrbitControls from @react-three/drei

## 🐛 Troubleshooting

### Projects not saving

- Check browser console for errors
- Verify localStorage is enabled
- Try clearing cache and reloading

### Touch gestures not working

- Ensure you're on a touch device
- Try refreshing the page
- Check browser compatibility (modern browsers only)

### Performance on iPad

- Limit total triangle count in scenes
- Use binary STL for exports (smaller files)
- Close other browser tabs
- Consider mesh optimization before import

## 📊 Browser Compatibility

### Tested Browsers

- ✅ Chrome 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Edge 90+

### Touch Support

- ✅ iPad (iOS 13+)
- ✅ Android tablets
- ✅ Surface/Windows tablets
- ✅ Chromebook touch screens

## 🎯 Future Enhancements

### Planned Features

- [ ] Cloud sync option
- [ ] Project thumbnails (auto-generated)
- [ ] Collaborative editing
- [ ] Import from URL
- [ ] Template projects
- [ ] Export entire project as ZIP
- [ ] Gesture customization
- [ ] Multi-touch transform controls

---

**Built with**: React 19, Three.js, @react-three/fiber, Vite

**Storage**: Browser LocalStorage API

**Touch**: Native Web Touch Events API
