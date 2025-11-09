// frontend/src/pages/ProjectManagement.jsx
import React, { useState, useEffect } from "react";
// Corrected imports and ensured necessary files are being generated now.
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt } from "react-icons/fa"; // External package import

const ProjectManagementPage = () => {
  // IMPORTANT: Custom modal UI must be used instead of window.confirm/alert in the final version
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    short_desc: "",
    long_desc: "",
    tech_stack: "",
    link_to_demo: "",
    model_type: "sphere",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/portfolio/projects");
      setProjects(data);
      setError(null);
    } catch (err) {
      // Note: 401 Unauthorized errors are handled by the API interceptor in api.js
      setError(
        "Could not fetch projects. Check backend status or if you are authorized."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTechStackChange = (e) => {
    // Split comma-separated string into an array, trim whitespace
    setFormData({
      ...formData,
      tech_stack: e.target.value.split(",").map((t) => t.trim()),
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const method = isEditing ? "put" : "post";
    const url = isEditing
      ? `/portfolio/projects/${formData._id}`
      : "/portfolio/projects";

    try {
      await API[method](url, {
        ...formData,
        // Ensure tech_stack is an array of strings for the API
        tech_stack: Array.isArray(formData.tech_stack)
          ? formData.tech_stack
          : formData.tech_stack.split(",").map((t) => t.trim()),
      });
      resetForm();
      fetchProjects();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Operation failed. Check if you are logged in or if the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setIsEditing(true);
    setFormData({
      ...project,
      // Convert array back to comma-separated string for the input field
      tech_stack: project.tech_stack.join(", "),
    });
    window.scrollTo(0, 0); // Scroll to the form
  };

  // Replacement for window.confirm
  const confirmDelete = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    setLoading(true);
    setShowDeleteModal(false);
    try {
      await API.delete(`/portfolio/projects/${projectToDelete._id}`);
      fetchProjects();
    } catch (err) {
      setError(
        err.response?.data?.message || "Deletion failed. Check authorization."
      );
    } finally {
      setLoading(false);
      setProjectToDelete(null);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData({
      title: "",
      short_desc: "",
      long_desc: "",
      tech_stack: "",
      link_to_demo: "",
      model_type: "sphere",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 font-inter">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-700">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-4 sm:mb-0">
          Admin Dashboard (CRUD)
        </h1>
        <div className="flex space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-sm sm:text-base font-semibold transition duration-300"
          >
            Back to 3D Portfolio
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm sm:text-base font-semibold transition duration-300"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-600 p-4 rounded-lg mb-6 text-center shadow-lg">
          {error}
        </div>
      )}

      {/* Project Form */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white border-b border-gray-700 pb-2">
          {isEditing ? "Edit Project" : "Add New Project"}
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Project Title"
            value={formData.title}
            onChange={handleFormChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400 text-white"
            required
          />
          <input
            type="text"
            name="short_desc"
            placeholder="Short Description (max 100 chars)"
            value={formData.short_desc}
            onChange={handleFormChange}
            maxLength={100}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400 text-white"
            required
          />
          <textarea
            name="long_desc"
            placeholder="Detailed Description"
            value={formData.long_desc}
            onChange={handleFormChange}
            rows="4"
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400 text-white"
            required
          />
          <input
            type="text"
            name="tech_stack"
            placeholder="Tech Stack (comma-separated, e.g., React, Node, MongoDB)"
            value={
              Array.isArray(formData.tech_stack)
                ? formData.tech_stack.join(", ")
                : formData.tech_stack
            }
            onChange={handleTechStackChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400 text-white"
            required
          />
          <input
            type="url"
            name="link_to_demo"
            placeholder="Live Demo URL (Optional)"
            value={formData.link_to_demo}
            onChange={handleFormChange}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400 text-white"
          />
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <select
              name="model_type"
              value={formData.model_type}
              onChange={handleFormChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-amber-500 focus:border-amber-500 text-white"
            >
              <option value="sphere">Sphere (Default)</option>
              <option value="cube">Cube</option>
              <option value="monitor">Monitor (Advanced)</option>
            </select>
            <button
              type="submit"
              className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition duration-300 w-full ${
                isEditing
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/50"
                  : "bg-teal-600 hover:bg-teal-700 shadow-teal-500/50"
              } disabled:opacity-50 shadow-md`}
              disabled={loading}
            >
              {loading ? (
                "Processing..."
              ) : isEditing ? (
                <>
                  <FaEdit className="mr-2" /> Update Project
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" /> Add Project
                </>
              )}
            </button>
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full py-2 bg-gray-600 hover:bg-gray-700 rounded-lg mt-2 font-semibold transition duration-300 shadow-md"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* Project List */}
      <h2 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-2">
        Existing Projects
      </h2>
      {loading && (
        <p className="text-center text-gray-400">Loading projects...</p>
      )}
      <div className="space-y-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project._id}
              className="bg-gray-800 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center transition duration-300 hover:shadow-xl hover:border-amber-500 border border-gray-700"
            >
              <div className="mb-3 sm:mb-0">
                <h3 className="text-xl font-bold text-teal-400">
                  {project.title}
                </h3>
                <p className="text-gray-400 text-sm">{project.short_desc}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tech Stack: {project.tech_stack.join(", ")}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleEdit(project)}
                  className="text-indigo-400 hover:text-indigo-300 p-2 rounded-full transition duration-300 bg-gray-700 hover:bg-gray-600"
                >
                  <FaEdit size={20} />
                </button>
                <button
                  onClick={() => confirmDelete(project)}
                  className="text-red-400 hover:text-red-300 p-2 rounded-full transition duration-300 bg-gray-700 hover:bg-gray-600"
                >
                  <FaTrash size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 p-8 bg-gray-800 rounded-xl">
            No projects found. Add one above to showcase your work!
          </p>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-red-500">
            <h3 className="text-xl font-bold mb-4 text-red-400">
              Confirm Deletion
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to permanently delete the project: **
              {projectToDelete.title}**?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagementPage;
