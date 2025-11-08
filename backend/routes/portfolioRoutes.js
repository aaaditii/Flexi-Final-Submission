// backend/routes/portfolioRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/portfolioController");

// GET all projects (Public access)
router.route("/projects").get(getProjects);

// POST a new project (Protected/Admin access)
// PUT/DELETE a project by ID (Protected/Admin access)
router.route("/projects").post(protect, createProject);

router
  .route("/projects/:id")
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;
