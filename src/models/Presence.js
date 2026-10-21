import mongoose from "mongoose";

const PresenceSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastSeen: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ipHash: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for automatic cleanup of presence records older than 10 minutes
PresenceSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 600 });

export default mongoose.models.Presence || mongoose.model("Presence", PresenceSchema);
