import { useState, useEffect } from "react";
import {
  getAllProjects,
  deleteProject,
  createNewProject,
  setCurrentProjectId,
} from "../utils/projectStorage";
import "./LandingPage.css";

export default function LandingPage({ onOpenProject, onCreateProject }) {
  const [projects, setProjects] = useState([]);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = getAllProjects();
    setProjects(allProjects);
  };

  const handleCreateNew = () => {
    const name = newProjectName.trim() || "Untitled Project";
    const project = createNewProject(name);
    setCurrentProjectId(project.id);
    setShowNewProjectDialog(false);
    setNewProjectName("");
    onCreateProject(project);
  };

  const handleOpenProject = (project) => {
    setCurrentProjectId(project.id);
    onOpenProject(project);
  };

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(projectId);
      loadProjects();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="landing-page">
      <div className="landing-header">
        <div className="landing-title">
          <h1>🏗️ Habitat Creator</h1>
          <p>Create and manage your 3D habitat models</p>
        </div>
        <button
          className="btn-new-project"
          onClick={() => setShowNewProjectDialog(true)}
        >
          + New Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No projects yet</h2>
            <p>Create your first habitat model to get started</p>
            <button
              className="btn-create-first"
              onClick={() => setShowNewProjectDialog(true)}
            >
              Create First Project
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => handleOpenProject(project)}
            >
              <div className="project-thumbnail">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.name} />
                ) : (
                  <div className="thumbnail-placeholder">
                    <span>🏗️</span>
                  </div>
                )}
              </div>
              <div className="project-info">
                <h3>{project.name}</h3>
                <div className="project-meta">
                  <span className="object-count">
                    {project.objects?.length || 0} objects
                  </span>
                  <span className="project-date">
                    {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
              <button
                className="btn-delete-project"
                onClick={(e) => handleDeleteProject(e, project.id)}
                title="Delete project"
              >
                ✖
              </button>
            </div>
          ))
        )}
      </div>

      {showNewProjectDialog && (
        <div
          className="modal-overlay"
          onClick={() => setShowNewProjectDialog(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <input
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateNew()}
              autoFocus
              className="project-name-input"
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowNewProjectDialog(false);
                  setNewProjectName("");
                }}
              >
                Cancel
              </button>
              <button className="btn-create" onClick={handleCreateNew}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
