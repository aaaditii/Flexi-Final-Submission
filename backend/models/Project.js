// backend/models/Project.js
const mongoose = require("mongoose");

// Schema for a Portfolio Project item
const projectSchema = mongoose.Schema(
  {
    // Name of the project
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Short description for the 3D display
    short_desc: {
      type: String,
      required: true,
      maxlength: 100,
    },
    // Detailed description (used in a modal)
    long_desc: {
      type: String,
      required: true,
    },
    // Technologies used, for dynamic display in 3D scene
    tech_stack: {
      type: [String], // Array of strings (e.g., ['React', 'Node', 'MongoDB'])
      required: true,
    },
    // Link to the live demo or GitHub repo
    link_to_demo: {
      type: String,
      required: false,
    },
    // A placeholder for a 3D model path or a simple image URL (for the aesthetic)
    model_type: {
      type: String, // e.g., 'cube', 'sphere', 'monitor'
      default: "sphere",
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
