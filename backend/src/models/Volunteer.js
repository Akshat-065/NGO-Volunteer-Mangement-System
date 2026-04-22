import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    skills: {
      type: [String],
      default: []
    },
    availability: {
      type: String,
      default: "Flexible"
    }
  },
  {
    timestamps: true
  }
);

const Volunteer = mongoose.model("Volunteer", volunteerSchema);

export default Volunteer;

