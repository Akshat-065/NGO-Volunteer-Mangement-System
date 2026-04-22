import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Volunteer",
      required: true
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

applicationSchema.index({ volunteerId: 1, eventId: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;

