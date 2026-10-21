import mongoose from "mongoose";

const ShareLeadSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    projectTitle: {
      type: String,
      default: "Untitled Project",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    purpose: {
      type: String,
      default: "",
      trim: true,
    },
    shareUrl: {
      type: String,
      default: "",
    },
    shareToken: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "contacted", "archived"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ShareLead || mongoose.model("ShareLead", ShareLeadSchema);
