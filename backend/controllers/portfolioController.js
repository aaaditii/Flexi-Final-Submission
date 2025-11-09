// backend/controllers/portfolioController.js
const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");

// @desc    Fetch all projects (READ)
// @route   GET /api/portfolio/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({});
  res.json(projects);
});

// @desc    Create a new project (CREATE)
// @route   POST /api/portfolio/projects
// @access  Private (Admin Only)
const createProject = asyncHandler(async (req, res) => {
  const { title, short_desc, long_desc, tech_stack, link_to_demo, model_type } =
    req.body;

  if (!title || !short_desc || !long_desc || !tech_stack) {
    res.status(400).json({ message: "Please fill out all required fields" });
    return;
  }

  const project = new Project({
    title,
    short_desc,
    long_desc,
    tech_stack,
    link_to_demo,
    model_type,
  });

  const createdProject = await project.save();
  res.status(201).json(createdProject);
});

// @desc    Update a project (UPDATE)
// @route   PUT /api/portfolio/projects/:id
// @access  Private (Admin Only)
const updateProject = asyncHandler(async (req, res) => {
  const { title, short_desc, long_desc, tech_stack, link_to_demo, model_type } =
    req.body;
  const project = await Project.findById(req.params.id);

  if (project) {
    project.title = title || project.title;
    project.short_desc = short_desc || project.short_desc;
    project.long_desc = long_desc || project.long_desc;
    project.tech_stack = tech_stack || project.tech_stack;
    project.link_to_demo = link_to_demo || project.link_to_demo;
    project.model_type = model_type || project.model_type;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } else {
    res.status(404).json({ message: "Project not found" });
  }
});

// @desc    Delete a project (DELETE)
// @route   DELETE /api/portfolio/projects/:id
// @access  Private (Admin Only)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: "Project removed" });
  } else {
    res.status(404).json({ message: "Project not found" });
  }
});

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
