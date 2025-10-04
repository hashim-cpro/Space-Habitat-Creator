// Nexus Habitat Architect - Advanced Space Design Tool

class NexusHabitatArchitect {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.habitat = null;
        this.modules = [];
        this.currentLayout = 'linear';
        this.isDragging = false;
        this.draggedModule = null;
        this.selectedModule = null;
        
        // Mission parameters
        this.crewSize = 6;
        this.missionDuration = 365;
        this.launchVehicle = 'falcon-heavy';
        this.destination = 'mars';
        
        // Habitat dimensions
        this.diameter = 15.0;
        this.length = 30.0;
        this.volume = 5301;
        
        // Module requirements
        this.moduleRequirements = {
            sleep: { minPerPerson: 1.5, priority: 'critical', color: '#4a90e2' },
            hygiene: { minPerPerson: 1.0, priority: 'critical', color: '#7ed321' },
            kitchen: { minPerPerson: 2.0, priority: 'important', color: '#f5a623' },
            exercise: { minPerPerson: 2.5, priority: 'important', color: '#bd10e0' },
            work: { minPerPerson: 1.5, priority: 'critical', color: '#50e3c2' },
            storage: { minPerPerson: 0.8, priority: 'important', color: '#9013fe' },
            'life-support': { minPerPerson: 0.3, priority: 'critical', color: '#ff6b35' },
            recreation: { minPerPerson: 1.5, priority: 'optional', color: '#00d4ff' },
            medical: { minPerPerson: 1.0, priority: 'important', color: '#ff4444' },
            greenhouse: { minPerPerson: 2.0, priority: 'optional', color: '#00ff88' }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initThreeJS();
        this.updateDimensions();
        this.createInitialHabitat();
        this.hideLoadingOverlay();
        this.updateAnalysis();
    }
    
    setupEventListeners() {
        // Mission parameter changes
        document.getElementById('crewSize').addEventListener('input', (e) => {
            this.crewSize = parseInt(e.target.value);
            this.updateAnalysis();
        });
        
        document.getElementById('missionDuration').addEventListener('input', (e) => {
            this.missionDuration = parseInt(e.target.value);
            this.updateAnalysis();
        });
        
        document.getElementById('launchVehicle').addEventListener('change', (e) => {
            this.launchVehicle = e.target.value;
            this.updateConstraints();
        });
        
        document.getElementById('destination').addEventListener('change', (e) => {
            this.destination = e.target.value;
            this.updateAnalysis();
        });
        
        // Dimension controls
        document.getElementById('diameterSlider').addEventListener('input', (e) => {
            this.diameter = parseFloat(e.target.value);
            document.getElementById('diameterValue').textContent = `${this.diameter}m`;
            this.updateDimensions();
        });
        
        document.getElementById('lengthSlider').addEventListener('input', (e) => {
            this.length = parseFloat(e.target.value);
            document.getElementById('lengthValue').textContent = `${this.length}m`;
            this.updateDimensions();
        });
        
        // Layout options
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentLayout = e.target.dataset.layout;
                this.applyLayout();
                this.updateAnalysis();
            });
        });
        
        // Viewport controls
        document.getElementById('resetView').addEventListener('click', () => this.resetCamera());
        document.getElementById('toggleWireframe').addEventListener('click', () => this.toggleWireframe());
        document.getElementById('toggleGrid').addEventListener('click', () => this.toggleGrid());
        document.getElementById('toggleLighting').addEventListener('click', () => this.toggleLighting());
        document.getElementById('screenshot').addEventListener('click', () => this.takeScreenshot());
        
        // Advanced tools
        document.getElementById('optimizeLayout').addEventListener('click', () => this.optimizeLayout());
        document.getElementById('compareLayouts').addEventListener('click', () => this.compareLayouts());
        document.getElementById('generateReport').addEventListener('click', () => this.generateReport());
        
        // Header controls
        document.getElementById('newDesign').addEventListener('click', () => this.newDesign());
        document.getElementById('saveDesign').addEventListener('click', () => this.saveDesign());
        document.getElementById('loadDesign').addEventListener('click', () => this.loadDesign());
        document.getElementById('exportDesign').addEventListener('click', () => this.exportDesign());
        
        // Module drag and drop
        this.setupDragAndDrop();
        
        // Modal controls
        this.setupModalControls();
        
    }
    
    setupDragAndDrop() {
        const moduleItems = document.querySelectorAll('.module-item');
        const viewport = document.getElementById('three-container');
        
        moduleItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.isDragging = true;
                this.draggedModule = e.target.dataset.module;
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.module);
            });
            
            item.addEventListener('dragend', (e) => {
                this.isDragging = false;
                this.draggedModule = null;
                e.target.classList.remove('dragging');
            });
        });
        
        viewport.addEventListener('dragover', (e) => {
            e.preventDefault();
            viewport.classList.add('drag-over');
        });
        
        viewport.addEventListener('dragleave', (e) => {
            viewport.classList.remove('drag-over');
        });
        
        viewport.addEventListener('drop', (e) => {
            e.preventDefault();
            viewport.classList.remove('drag-over');
            
            const moduleType = e.dataTransfer.getData('text/plain');
            const rect = viewport.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.addModule(moduleType, x, y);
        });
        
        // Add click handler for module selection
        viewport.addEventListener('click', (e) => {
            const mouse = new THREE.Vector2();
            mouse.x = (e.clientX / viewport.clientWidth) * 2 - 1;
            mouse.y = -(e.clientY / viewport.clientHeight) * 2 + 1;
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            const intersects = raycaster.intersectObjects(this.modules);
            if (intersects.length > 0) {
                this.selectModule(intersects[0].object);
            } else {
                this.selectModule(null);
            }
        });
    }
    
    setupModalControls() {
        const modal = document.getElementById('moduleModal');
        const closeBtn = document.querySelector('.modal-close');
        const saveBtn = document.getElementById('saveModule');
        const deleteBtn = document.getElementById('deleteModule');
        
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        saveBtn.addEventListener('click', () => {
            this.saveModuleProperties();
            modal.classList.remove('active');
        });
        
        deleteBtn.addEventListener('click', () => {
            this.deleteSelectedModule();
            modal.classList.remove('active');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    
    initThreeJS() {
        const container = document.getElementById('three-container');
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(15, 15, 15);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x0a0a0f, 1);
        container.appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Lighting
        this.setupLighting();
        
        // Grid
        this.setupGrid();
        
        // Animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        this.mainLight = new THREE.DirectionalLight(0x00f5ff, 1);
        this.mainLight.position.set(20, 20, 10);
        this.mainLight.castShadow = true;
        this.mainLight.shadow.mapSize.width = 2048;
        this.mainLight.shadow.mapSize.height = 2048;
        this.mainLight.shadow.camera.near = 0.5;
        this.mainLight.shadow.camera.far = 50;
        this.mainLight.shadow.camera.left = -25;
        this.mainLight.shadow.camera.right = 25;
        this.mainLight.shadow.camera.top = 25;
        this.mainLight.shadow.camera.bottom = -25;
        this.scene.add(this.mainLight);
        
        // Accent lights
        const accentLight1 = new THREE.PointLight(0xff6b35, 0.5, 30);
        accentLight1.position.set(-10, 10, 5);
        this.scene.add(accentLight1);
        
        const accentLight2 = new THREE.PointLight(0xffd700, 0.3, 25);
        accentLight2.position.set(10, 5, -5);
        this.scene.add(accentLight2);
    }
    
    setupGrid() {
        this.gridHelper = new THREE.GridHelper(30, 30, 0x2a2a4f, 0x1a1a2e);
        this.scene.add(this.gridHelper);
    }
    
    createInitialHabitat() {
        this.clearHabitat();
        this.createHabitatStructure();
    }
    
    createHabitatStructure() {
        const group = new THREE.Group();
        
        // Main habitat cylinder
        const geometry = new THREE.CylinderGeometry(
            this.diameter / 2,
            this.diameter / 2,
            this.length,
            32
        );
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x1a1a2e,
            transparent: true,
            opacity: 0.2,
            wireframe: false
        });
        
        const habitat = new THREE.Mesh(geometry, material);
        habitat.position.y = this.length / 2;
        habitat.castShadow = true;
        habitat.receiveShadow = true;
        
        // Add wireframe outline
        const wireframeGeometry = new THREE.CylinderGeometry(
            this.diameter / 2 + 0.1,
            this.diameter / 2 + 0.1,
            this.length + 0.2,
            32
        );
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f5ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        wireframe.position.y = this.length / 2;
        
        group.add(habitat);
        group.add(wireframe);
        
        this.habitat = group;
        this.scene.add(group);
    }
    
    addModule(moduleType, x, z) {
        const moduleData = this.moduleRequirements[moduleType];
        if (!moduleData) return;
        
        const size = Math.max(moduleData.minPerPerson * this.crewSize, 2);
        const height = 1.0;
        
        // Convert screen coordinates to world coordinates
        const worldX = x * (this.diameter / 2 - 1);
        const worldZ = z * (this.diameter / 2 - 1);
        
        // Simple positioning - just use the world coordinates
        const finalX = worldX;
        const finalZ = worldZ;
        
        // Create module geometry
        const geometry = new THREE.BoxGeometry(size, height, size);
        const material = new THREE.MeshPhongMaterial({
            color: moduleData.color,
            transparent: true,
            opacity: 0.8
        });
        
        const moduleMesh = new THREE.Mesh(geometry, material);
        moduleMesh.position.set(finalX, height / 2, finalZ);
        moduleMesh.castShadow = true;
        moduleMesh.receiveShadow = true;
        
        // Add module data
        moduleMesh.userData = {
            type: moduleType,
            size: size,
            area: size * size,
            priority: moduleData.priority,
            color: moduleData.color
        };
        
        // Add selection outline
        const outlineGeometry = new THREE.BoxGeometry(size + 0.2, height + 0.2, size + 0.2);
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f5ff,
            wireframe: true,
            transparent: true,
            opacity: 0
        });
        const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outline.position.copy(moduleMesh.position);
        moduleMesh.add(outline);
        
        this.modules.push(moduleMesh);
        this.habitat.add(moduleMesh);
        
        // Add label
        this.addModuleLabel(moduleMesh, moduleType);
        
        this.updateAnalysis();
    }
    
    addModuleLabel(mesh, moduleType) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = '#ffffff';
        context.font = 'bold 20px Space Grotesk';
        context.textAlign = 'center';
        context.fillText(moduleType.toUpperCase(), canvas.width / 2, canvas.height / 2 + 6);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(3, 0.75, 1);
        sprite.position.copy(mesh.position);
        sprite.position.y += 2;
        
        this.habitat.add(sprite);
    }
    
    selectModule(module) {
        // Remove previous selection
        if (this.selectedModule) {
            this.selectedModule.children[0].material.opacity = 0;
        }
        
        this.selectedModule = module;
        
        if (module) {
            // Highlight selected module
            module.children[0].material.opacity = 1;
            
            // Open properties modal
            this.openModuleModal(module);
        }
    }
    
    openModuleModal(module) {
        const modal = document.getElementById('moduleModal');
        document.getElementById('moduleName').value = module.userData.type;
        document.getElementById('moduleSize').value = module.userData.size;
        document.getElementById('modulePriority').value = module.userData.priority;
        document.getElementById('moduleColor').value = module.userData.color;
        modal.classList.add('active');
    }
    
    saveModuleProperties() {
        if (!this.selectedModule) return;
        
        const name = document.getElementById('moduleName').value;
        const size = parseFloat(document.getElementById('moduleSize').value);
        const priority = document.getElementById('modulePriority').value;
        const color = document.getElementById('moduleColor').value;
        
        this.selectedModule.userData.type = name;
        this.selectedModule.userData.size = size;
        this.selectedModule.userData.priority = priority;
        this.selectedModule.userData.color = color;
        
        // Update module appearance
        this.selectedModule.material.color.setHex(color.replace('#', '0x'));
        this.selectedModule.scale.set(size / 4, 1, size / 4);
        
        this.updateAnalysis();
    }
    
    deleteSelectedModule() {
        if (!this.selectedModule) return;
        
        this.habitat.remove(this.selectedModule);
        const index = this.modules.indexOf(this.selectedModule);
        if (index > -1) {
            this.modules.splice(index, 1);
        }
        
        this.selectedModule = null;
        this.updateAnalysis();
    }
    
    updateDimensions() {
        this.volume = Math.PI * Math.pow(this.diameter / 2, 2) * this.length;
        document.getElementById('volumeValue').textContent = `${Math.round(this.volume)}m³`;
        
        const volumeFill = document.getElementById('volumeFill');
        const maxVolume = 2000; // Maximum expected volume
        const percentage = Math.min((this.volume / maxVolume) * 100, 100);
        volumeFill.style.width = `${percentage}%`;
        
        this.recreateHabitat();
    }
    
    updateConstraints() {
        const vehicleConstraints = {
            'falcon-heavy': { diameter: 4.6, length: 12.0 },
            'sls': { diameter: 8.4, length: 20.0 },
            'starship': { diameter: 9.0, length: 50.0 },
            'new-glenn': { diameter: 7.0, length: 30.0 },
            'custom': { diameter: 6.0, length: 15.0 }
        };
        
        const constraints = vehicleConstraints[this.launchVehicle];
        this.diameter = Math.min(this.diameter, constraints.diameter);
        this.length = Math.min(this.length, constraints.length);
        
        document.getElementById('diameterSlider').value = this.diameter;
        document.getElementById('lengthSlider').value = this.length;
        document.getElementById('diameterValue').textContent = `${this.diameter}m`;
        document.getElementById('lengthValue').textContent = `${this.length}m`;
        
        this.updateDimensions();
    }
    
    recreateHabitat() {
        if (this.habitat) {
            this.scene.remove(this.habitat);
        }
        this.modules = [];
        this.createInitialHabitat();
    }
    
    applyLayout() {
        if (this.currentLayout === 'radial') {
            this.applyRadialLayout();
        } else if (this.currentLayout === 'multi-level') {
            this.applyMultiLevelLayout();
        } else if (this.currentLayout === 'spiral') {
            this.applySpiralLayout();
        } else {
            this.applyLinearLayout();
        }
    }
    
    applyRadialLayout() {
        const centerX = 0;
        const centerZ = 0;
        const radius = this.diameter / 2 - 1;
        
        this.modules.forEach((module, index) => {
            const angle = (index / this.modules.length) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const z = centerZ + Math.sin(angle) * radius;
            
            module.position.set(x, module.position.y, z);
            module.rotation.y = angle + Math.PI / 2;
        });
    }
    
    applyMultiLevelLayout() {
        const levels = 3;
        const modulesPerLevel = Math.ceil(this.modules.length / levels);
        
        this.modules.forEach((module, index) => {
            const level = Math.floor(index / modulesPerLevel);
            const levelIndex = index % modulesPerLevel;
            
            const x = (levelIndex % 2) * 4 - 2;
            const z = Math.floor(levelIndex / 2) * 4 - 2;
            const y = level * 3 + 0.5;
            
            module.position.set(x, y, z);
        });
    }
    
    applySpiralLayout() {
        const radius = this.diameter / 2 - 1;
        const heightStep = 2;
        
        this.modules.forEach((module, index) => {
            const angle = index * 0.5;
            const spiralRadius = radius * (1 - index / this.modules.length * 0.3);
            const x = Math.cos(angle) * spiralRadius;
            const z = Math.sin(angle) * spiralRadius;
            const y = (index * heightStep) % (this.length - 2) + 1;
            
            module.position.set(x, y, z);
            module.rotation.y = angle;
        });
    }
    
    applyLinearLayout() {
        this.modules.forEach((module, index) => {
            const x = (index % 3) * 4 - 4;
            const z = Math.floor(index / 3) * 4 - 4;
            
            module.position.set(x, module.position.y, z);
        });
    }
    
    updateAnalysis() {
        this.updateMetrics();
        this.updateValidation();
        this.updateDistributionChart();
        this.updateModuleCount();
    }
    
    updateMetrics() {
        const totalVolume = this.modules.reduce((sum, module) => sum + module.userData.area * 2.5, 0);
        const crewDensity = this.crewSize > 0 ? totalVolume / this.crewSize : 0;
        const efficiency = this.volume > 0 ? (totalVolume / this.volume) * 100 : 0;
        const designScore = this.calculateDesignScore();
        
        document.getElementById('totalVolume').textContent = `${Math.round(totalVolume)}m³`;
        document.getElementById('crewDensity').textContent = `${Math.round(crewDensity)}m³/person`;
        document.getElementById('efficiency').textContent = `${Math.round(efficiency)}%`;
        document.getElementById('designScore').textContent = `${Math.round(designScore)}/100`;
    }
    
    calculateDesignScore() {
        let score = 0;
        
        // Volume efficiency (30 points)
        const totalVolume = this.modules.reduce((sum, module) => sum + module.userData.area * 2.5, 0);
        const volumeEfficiency = this.volume > 0 ? (totalVolume / this.volume) * 100 : 0;
        score += Math.min(30, volumeEfficiency * 0.3);
        
        // Module requirements fulfillment (40 points)
        const moduleChecks = this.checkModuleRequirements();
        const fulfilledRequirements = moduleChecks.filter(check => check.valid).length;
        const totalRequirements = moduleChecks.length;
        score += (fulfilledRequirements / totalRequirements) * 40;
        
        // Layout optimization (30 points)
        const layoutScore = this.getLayoutOptimizationScore();
        score += layoutScore;
        
        return Math.min(100, Math.max(0, score));
    }
    
    checkModuleRequirements() {
        const checks = [];
        const moduleCounts = {};
        
        this.modules.forEach(module => {
            const type = module.userData.type;
            moduleCounts[type] = (moduleCounts[type] || 0) + 1;
        });
        
        Object.keys(this.moduleRequirements).forEach(moduleType => {
            const required = this.moduleRequirements[moduleType];
            const minArea = required.minPerPerson * this.crewSize;
            const currentArea = this.modules
                .filter(module => module.userData.type === moduleType)
                .reduce((sum, module) => sum + module.userData.area, 0);
            
            const valid = currentArea >= minArea;
            
            checks.push({
                valid,
                message: `${moduleType}: ${Math.round(currentArea)}m² / ${Math.round(minArea)}m² required`,
                type: valid ? 'success' : (required.priority === 'critical' ? 'error' : 'warning')
            });
        });
        
        return checks;
    }
    
    getLayoutOptimizationScore() {
        let score = 0;
        
        // Check for proper spacing between modules
        const minDistance = 2;
        let validSpacing = 0;
        let totalPairs = 0;
        
        for (let i = 0; i < this.modules.length; i++) {
            for (let j = i + 1; j < this.modules.length; j++) {
                const distance = this.modules[i].position.distanceTo(this.modules[j].position);
                totalPairs++;
                if (distance >= minDistance) {
                    validSpacing++;
                }
            }
        }
        
        if (totalPairs > 0) {
            score += (validSpacing / totalPairs) * 15;
        }
        
        // Layout-specific optimizations
        if (this.currentLayout === 'radial') {
            const centerDistance = this.modules.reduce((sum, module) => sum + module.position.length(), 0) / this.modules.length;
            const expectedRadius = this.diameter / 2 - 1;
            const radiusScore = Math.max(0, 15 - Math.abs(centerDistance - expectedRadius));
            score += radiusScore;
        } else if (this.currentLayout === 'multi-level') {
            const levels = [...new Set(this.modules.map(module => Math.floor(module.position.y / 3)))];
            const levelDistribution = levels.length / 3;
            score += levelDistribution * 15;
        } else if (this.currentLayout === 'spiral') {
            // Check spiral distribution
            score += 15;
        } else {
            // Linear layout optimization
            const xPositions = this.modules.map(module => module.position.x).sort((a, b) => a - b);
            let linearScore = 0;
            for (let i = 1; i < xPositions.length; i++) {
                const spacing = xPositions[i] - xPositions[i-1];
                if (spacing >= 2 && spacing <= 4) {
                    linearScore += 5;
                }
            }
            score += Math.min(15, linearScore);
        }
        
        return score;
    }
    
    updateValidation() {
        const container = document.getElementById('validationList');
        container.innerHTML = '';
        
        const moduleChecks = this.checkModuleRequirements();
        
        moduleChecks.forEach(check => {
            const item = document.createElement('div');
            item.className = `validation-item ${check.type}`;
            
            const icon = check.valid ? '✅' : (check.type === 'error' ? '❌' : '⚠️');
            item.innerHTML = `
                <span class="validation-icon">${icon}</span>
                <span class="validation-text">${check.message}</span>
            `;
            
            container.appendChild(item);
        });
    }
    
    updateDistributionChart() {
        const container = document.getElementById('distributionChart');
        container.innerHTML = '';
        
        const moduleTypes = [...new Set(this.modules.map(module => module.userData.type))];
        
        moduleTypes.forEach(type => {
            const count = this.modules.filter(module => module.userData.type === type).length;
            const total = this.modules.length;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            
            const item = document.createElement('div');
            item.className = 'chart-item';
            item.innerHTML = `
                <div class="chart-label">${type.toUpperCase()}</div>
                <div class="chart-bar">
                    <div class="chart-fill" style="width: ${percentage}%"></div>
                    <span class="chart-value">${count}</span>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    updateModuleCount() {
        document.getElementById('moduleCount').textContent = this.modules.length;
        
        const totalVolume = this.modules.reduce((sum, module) => sum + module.userData.area * 2.5, 0);
        const utilization = this.volume > 0 ? (totalVolume / this.volume) * 100 : 0;
        document.getElementById('utilization').textContent = `${Math.round(utilization)}%`;
    }
    
    // Viewport controls
    resetCamera() {
        this.camera.position.set(15, 15, 15);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
    
    toggleWireframe() {
        this.habitat.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.wireframe = !child.material.wireframe;
            }
        });
    }
    
    toggleGrid() {
        this.gridHelper.visible = !this.gridHelper.visible;
    }
    
    toggleLighting() {
        this.mainLight.visible = !this.mainLight.visible;
    }
    
    takeScreenshot() {
        const canvas = this.renderer.domElement;
        const link = document.createElement('a');
        link.download = `habitat-design-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
    
    // Advanced tools
    optimizeLayout() {
        if (this.modules.length === 0) return;
        
        // Clear existing modules from habitat
        this.modules.forEach(module => {
            this.habitat.remove(module);
        });
        
        // Arrange modules in a grid pattern inside the habitat
        const maxRadius = this.diameter / 2 - 2; // Leave margin from edge
        const modulesPerRow = Math.ceil(Math.sqrt(this.modules.length));
        const spacing = (maxRadius * 2) / modulesPerRow;
        
        this.modules.forEach((module, index) => {
            const row = Math.floor(index / modulesPerRow);
            const col = index % modulesPerRow;
            
            // Calculate position in grid
            const x = (col - (modulesPerRow - 1) / 2) * spacing;
            const z = (row - (Math.ceil(this.modules.length / modulesPerRow) - 1) / 2) * spacing;
            
            // Ensure module stays within habitat boundary
            const distanceFromCenter = Math.sqrt(x * x + z * z);
            const moduleRadius = module.userData.size / 2;
            const maxAllowedRadius = this.diameter / 2 - moduleRadius - 1;
            
            if (distanceFromCenter > maxAllowedRadius) {
                // Snap to boundary if outside
                const angle = Math.atan2(z, x);
                const clampedX = Math.cos(angle) * maxAllowedRadius;
                const clampedZ = Math.sin(angle) * maxAllowedRadius;
                module.position.set(clampedX, module.position.y, clampedZ);
            } else {
                module.position.set(x, module.position.y, z);
            }
            
            // Add module back to habitat
            this.habitat.add(module);
        });
        
        this.updateAnalysis();
    }
    
    compareLayouts() {
        const layouts = ['linear', 'radial', 'multi-level', 'spiral'];
        const results = {};
        
        const currentLayout = this.currentLayout;
        
        layouts.forEach(layout => {
            this.currentLayout = layout;
            this.applyLayout();
            results[layout] = this.calculateDesignScore();
        });
        
        this.currentLayout = currentLayout;
        this.applyLayout();
        
        // Show comparison results
        alert(`Layout Comparison:\n${Object.entries(results).map(([layout, score]) => `${layout}: ${Math.round(score)}/100`).join('\n')}`);
    }
    
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            mission: {
                crewSize: this.crewSize,
                duration: this.missionDuration,
                launchVehicle: this.launchVehicle,
                destination: this.destination
            },
            habitat: {
                diameter: this.diameter,
                length: this.length,
                volume: this.volume,
                layout: this.currentLayout
            },
            modules: this.modules.map(module => ({
                type: module.userData.type,
                position: module.position,
                size: module.userData.size,
                area: module.userData.area,
                priority: module.userData.priority
            })),
            metrics: {
                totalVolume: this.modules.reduce((sum, module) => sum + module.userData.area * 2.5, 0),
                crewDensity: this.crewSize > 0 ? this.modules.reduce((sum, module) => sum + module.userData.area * 2.5, 0) / this.crewSize : 0,
                efficiency: this.volume > 0 ? (this.modules.reduce((sum, module) => sum + module.userData.area * 2.5, 0) / this.volume) * 100 : 0,
                designScore: this.calculateDesignScore()
            }
        };
        
        const reportText = this.formatReport(report);
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `nexus-habitat-report-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    formatReport(report) {
        let text = 'NEXUS HABITAT ARCHITECT - DESIGN REPORT\n';
        text += '='.repeat(60) + '\n\n';
        
        text += `Generated: ${new Date(report.timestamp).toLocaleString()}\n\n`;
        
        text += 'MISSION PARAMETERS:\n';
        text += `- Crew Size: ${report.mission.crewSize} people\n`;
        text += `- Mission Duration: ${report.mission.duration} days\n`;
        text += `- Launch Vehicle: ${report.mission.launchVehicle}\n`;
        text += `- Destination: ${report.mission.destination}\n\n`;
        
        text += 'HABITAT SPECIFICATIONS:\n';
        text += `- Diameter: ${report.habitat.diameter}m\n`;
        text += `- Length: ${report.habitat.length}m\n`;
        text += `- Volume: ${Math.round(report.habitat.volume)}m³\n`;
        text += `- Layout: ${report.habitat.layout}\n\n`;
        
        text += 'DESIGN METRICS:\n';
        text += `- Total Module Volume: ${Math.round(report.metrics.totalVolume)}m³\n`;
        text += `- Crew Density: ${Math.round(report.metrics.crewDensity)}m³/person\n`;
        text += `- Space Efficiency: ${Math.round(report.metrics.efficiency)}%\n`;
        text += `- Design Score: ${Math.round(report.metrics.designScore)}/100\n\n`;
        
        text += 'MODULE INVENTORY:\n';
        report.modules.forEach((module, index) => {
            text += `${index + 1}. ${module.type.toUpperCase()}\n`;
            text += `   - Size: ${module.size}m x ${module.size}m\n`;
            text += `   - Area: ${Math.round(module.area)}m²\n`;
            text += `   - Priority: ${module.priority}\n`;
            text += `   - Position: (${module.position.x.toFixed(1)}, ${module.position.y.toFixed(1)}, ${module.position.z.toFixed(1)})\n\n`;
        });
        
        return text;
    }
    
    
    // File operations
    newDesign() {
        if (confirm('Create a new design? This will clear all current modules.')) {
            this.clearHabitat();
            this.createInitialHabitat();
            this.updateAnalysis();
        }
    }
    
    saveDesign() {
        const design = {
            modules: this.modules.map(module => ({
                type: module.userData.type,
                position: module.position,
                size: module.userData.size,
                area: module.userData.area,
                priority: module.userData.priority,
                color: module.userData.color
            })),
            habitat: {
                diameter: this.diameter,
                length: this.length,
                volume: this.volume,
                layout: this.currentLayout
            },
            mission: {
                crewSize: this.crewSize,
                duration: this.missionDuration,
                launchVehicle: this.launchVehicle,
                destination: this.destination
            }
        };
        
        const dataStr = JSON.stringify(design, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'nexus-habitat-design.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    loadDesign() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const design = JSON.parse(e.target.result);
                        this.loadDesignData(design);
                    } catch (error) {
                        alert('Error loading design file: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    loadDesignData(design) {
        // Update parameters
        this.crewSize = design.mission.crewSize || 6;
        this.missionDuration = design.mission.duration || 365;
        this.launchVehicle = design.mission.launchVehicle || 'falcon-heavy';
        this.destination = design.mission.destination || 'mars';
        this.diameter = design.habitat.diameter || 8.0;
        this.length = design.habitat.length || 20.0;
        this.currentLayout = design.habitat.layout || 'linear';
        
        // Update UI
        document.getElementById('crewSize').value = this.crewSize;
        document.getElementById('missionDuration').value = this.missionDuration;
        document.getElementById('launchVehicle').value = this.launchVehicle;
        document.getElementById('destination').value = this.destination;
        document.getElementById('diameterSlider').value = this.diameter;
        document.getElementById('lengthSlider').value = this.length;
        document.getElementById('diameterValue').textContent = `${this.diameter}m`;
        document.getElementById('lengthValue').textContent = `${this.length}m`;
        
        // Update layout buttons
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.layout === this.currentLayout);
        });
        
        // Recreate habitat
        this.updateDimensions();
        this.clearHabitat();
        this.createInitialHabitat();
        
        // Load modules
        if (design.modules) {
            design.modules.forEach(moduleData => {
                this.addModule(moduleData.type, moduleData.position.x / 10, moduleData.position.z / 10);
            });
        }
        
        this.updateAnalysis();
    }
    
    exportDesign() {
        // Export as 3D model (placeholder)
        alert('3D model export feature coming soon!');
    }
    
    clearHabitat() {
        if (this.habitat) {
            this.scene.remove(this.habitat);
        }
        this.modules = [];
        this.selectedModule = null;
    }
    
    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        const container = document.getElementById('three-container');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new NexusHabitatArchitect();
});

// Utility functions
function formatNumber(num, decimals = 1) {
    return parseFloat(num.toFixed(decimals));
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NexusHabitatArchitect;
}