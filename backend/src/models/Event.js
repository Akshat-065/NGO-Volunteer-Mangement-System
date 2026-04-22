import mongoose from "mongoose";

export const deriveEventStatus = (date) => {
  const eventDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today ? "Upcoming" : "Completed";
};

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Upcoming", "Completed"],
      default: "Upcoming"
    },
    assignedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Volunteer"
      }
    ]
  },
  {
    timestamps: true
  }
);

eventSchema.pre("save", function preSave(next) {
  this.status = deriveEventStatus(this.date);
  next();
});

const Event = mongoose.model("Event", eventSchema);

export default Event;

