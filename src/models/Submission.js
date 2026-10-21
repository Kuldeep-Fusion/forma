import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    formId: {
      type: String,
      default: "form-1",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    ipHash: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["received", "read", "archived"],
      default: "received",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose overwrite model compilation error during HMR
export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
