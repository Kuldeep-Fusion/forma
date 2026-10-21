import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    ownerSessionId: {
      type: String,
      required: true,
      index: true,
    },
    pageConfig: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    prompt: {
      type: String,
      default: "",
    },
    creativeDirection: {
      type: String,
      enum: ["editorial", "experimental", "minimal", "futuristic"],
      default: "editorial",
    },
    themePreference: {
      type: String,
      default: "ai_suggested",
    },
    motionStyle: {
      type: String,
      default: "cinematic",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    editTokenHash: {
      type: String,
      required: true,
    },
    shareTokenHash: {
      type: String,
      index: true,
      sparse: true,
    },
    shareExpiresAt: {
      type: Date,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for public community queries
ProjectSchema.index({ visibility: 1, status: 1, createdAt: -1 });

// Prevent re-compiling model in dev hot reloading
export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
