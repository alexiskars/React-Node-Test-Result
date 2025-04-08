const mongoose = require("mongoose");
const meetingHistory = new mongoose.Schema({
  agenda: { type: String, required: true },
  attendes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
    },
  ],
  attendesLead: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
  ],
  location: String,
  related: String,
  dateTime: String,
  endDateTime: {
    type: Date,
    default: function () {
      if (this.dateTime) {
        const startDate = new Date(this.dateTime);
        startDate.setHours(startDate.getHours() + 1);
        return startDate;
      }
      return null;
    },
  },
  notes: String,
  createByContact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contact",
  },
  createByLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
  },
  backgroundColor: {
    type: String,
    default: "red",
  },
  textColor: {
    type: String,
    default: "#ffffff",
  },
  allDay: {
    type: Boolean,
    default: false,
  },
  createBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});
module.exports = mongoose.model("Meetings", meetingHistory, "Meetings");
