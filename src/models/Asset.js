import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema(
  {
    ownerSessionId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: {
      type: String,
      index: true,
      sparse: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: "",
    },
    filename: {
      type: String,
      default: "",
    },
    mimeType: {
      type: String,
      default: "image/jpeg",
    },
    size: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
      enum: ["cloudinary", "local_persistent", "external"],
      default: "cloudinary",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Asset || mongoose.model("Asset", AssetSchema);
