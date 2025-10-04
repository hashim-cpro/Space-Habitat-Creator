# 🚀 QUICK TEST - 2 Minute Verification

## ⚡ Fast Test (Open http://localhost:5174/)

### **Step 1: Open Console** (F12)

Look for these emoji logs:

```
🎯 = Finding modules
✨ = Particles active
🧲 = Magnetic force
💎 = Module glowing
🛡️ = Collision detected
```

### **Step 2: Add 2 Cylinders**

1. Click **"Modules"** button
2. Select **"Rigid Cylinder"**
3. Click scene to place (module 1)
4. Click again to place (module 2)

### **Step 3: Drag & Watch**

1. Click module 1
2. **Drag toward module 2**
3. **Watch console** - should see:
   ```
   🎯 MagneticEffectManager: { selectedIds: 1, foundMeshes: 1 }
   ✨ Visual effects active: { distance: '4.20', particles: 24 }
   🧲 Magnetic force active: { distance: '3.45', force: '0.234' }
   💎 Module glow: 0.46
   ```
4. **Watch screen**:
   - ✅ Cyan particles orbiting target
   - ✅ Module glows cyan
   - ✅ Feel magnetic pull

### **Step 4: Test Collision**

1. Keep dragging **past** module 2
2. Should **STOP** at surface
3. Console shows:
   ```
   🛡️ COLLISION detected: { penetration: '0.245' }
   ```

---

## ✅ SUCCESS Checklist

- [ ] Console shows 🎯 emoji (modules found)
- [ ] Console shows ✨ emoji (particles active)
- [ ] Console shows 🧲 emoji (force working)
- [ ] Console shows 💎 emoji (glow active)
- [ ] Console shows 🛡️ emoji (collision working)
- [ ] **SEE** cyan particles on screen
- [ ] **SEE** module glowing cyan
- [ ] **FEEL** magnetic pull when dragging
- [ ] **STOP** at surface (can't pass through)

---

## 🐛 If Nothing Appears

### **Quick Fixes**:

1. **Hard Refresh**: Ctrl+Shift+R
2. **Check Distance**: Modules must be < 6m apart
3. **Check Module Type**: Must be from "Modules" panel
4. **Check Selection**: Module must be highlighted
5. **Check Dragging**: Must be actively dragging

### **Check Console for Errors**:

If you see:

```
🎯 MagneticEffectManager: { selectedIds: 1, foundMeshes: 0 }
```

**Problem**: Module not found in scene  
**Fix**: Refresh browser and try again

---

## 🎯 Expected Behavior

### **At 6m**:

- Particles appear
- Slow rotation

### **At 4.5m**:

- Magnetic pull starts
- Module begins glowing
- Console: 🧲 emoji

### **At 3m**:

- Strong pull
- Bright glow
- Many particles

### **At 1m**:

- Very strong pull
- Intense glow
- Hard to resist

### **At 0m**:

- SNAP!
- Lightning bolt
- Perfect alignment

---

## 📊 Console Sampling

Logs appear **~2% of frames** to avoid spam:

- ~1-2 logs per second
- Enough to verify it's working
- Not overwhelming

To see MORE logs, set `Math.random() > 0.9` (10x more frequent)

---

## 🎬 Video Test Sequence

1. **00:00** - Open http://localhost:5174/
2. **00:05** - Press F12 (open console)
3. **00:10** - Click "Modules" button
4. **00:15** - Add "Rigid Cylinder" x2
5. **00:20** - Click first cylinder (select)
6. **00:25** - Start dragging toward second
7. **00:30** - Watch console for 🎯 ✨ 🧲 💎
8. **00:35** - Watch screen for particles + glow
9. **00:40** - Try to pass through - should stop (🛡️)
10. **00:45** - Release - should snap together (⚡)

**Total Time**: 45 seconds

---

## 🎯 What You Should See

### **In Console**:

```
🎯 MagneticEffectManager: { selectedIds: 1, foundMeshes: 1, isModule: [true] }
✨ Visual effects active: { distance: '5.20', particles: 24 }
🧲 Magnetic force active: { distance: '4.45', force: '0.123' }
💎 Module glow: 0.23
🛡️ COLLISION detected: { penetration: '0.185' }
```

### **On Screen**:

- 24 **LARGE** cyan particles
- **BRIGHT** cyan glow on module
- Particles **ROTATING** around target
- Module **PULLING** toward target
- **STOPS** at collision

---

## 🚨 Emergency Debug

If STILL nothing:

1. Check `object.type` - should be `'module'`
2. Check `object.userData.isModule` - should be `true`
3. Check material - should be `MeshStandardMaterial`
4. Check scene - module should exist in scene
5. Check distance - use ruler/measure (< 6m)

---

**Server**: http://localhost:5174/ 🟢 **RUNNING**  
**Build**: ✅ **SUCCESS**  
**Fixes**: ✅ **APPLIED**  
**Ready**: 🚀 **GO!**

**Test it NOW!** ⚡
