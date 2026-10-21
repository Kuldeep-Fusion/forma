import mongoose from "mongoose";

const SiteStatsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
      index: true,
    },
    totalVisits: {
      type: Number,
      default: 1960,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SiteStats || mongoose.model("SiteStats", SiteStatsSchema);
