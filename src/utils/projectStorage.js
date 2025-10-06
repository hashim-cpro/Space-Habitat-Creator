// LocalStorage utility for project management
const STORAGE_KEY = "habitat-projects";
const CURRENT_PROJECT_KEY = "habitat-current-project";

export function getAllProjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load projects:", error);
    return [];
  }
}

export function getProject(id) {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id);
}

export function saveProject(project) {
  try {
    const projects = getAllProjects();
    const index = projects.findIndex((p) => p.id === project.id);

    const projectToSave = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      projects[index] = projectToSave;
    } else {
      projects.push(projectToSave);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return projectToSave;
  } catch (error) {
    console.error("Failed to save project:", error);
    throw error;
  }
}

export function deleteProject(id) {
  try {
    const projects = getAllProjects();
    const filtered = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    const currentId = getCurrentProjectId();
    if (currentId === id) {
      clearCurrentProject();
    }
  } catch (error) {
    console.error("Failed to delete project:", error);
    throw error;
  }
}

export function createNewProject(name = "Untitled Project") {
  return {
    id: generateId(),
    name,
    objects: [],
    objectIdCounter: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    thumbnail: null,
  };
}

export function getCurrentProjectId() {
  return localStorage.getItem(CURRENT_PROJECT_KEY);
}

export function setCurrentProjectId(id) {
  localStorage.setItem(CURRENT_PROJECT_KEY, id);
}

export function clearCurrentProject() {
  localStorage.removeItem(CURRENT_PROJECT_KEY);
}

function generateId() {
  return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createAutoSaver(saveCallback, delay = 2000) {
  let timeoutId = null;

  return function triggerSave() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      saveCallback();
    }, delay);
  };
}
