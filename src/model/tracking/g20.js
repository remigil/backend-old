// import ?mongoose from "mongoose";
require("../../config/mongo");
const mongoose = require("mongoose");

const collection = {
  id_user: String,
  latitude: Number,
  longitude: Number,
  date: Date,
};
const DocumentSchema = mongoose.Schema(collection, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  collection: "trackG20",
});

const TrackG20 = mongoose.model("TrackG20", DocumentSchema);

module.exports = { TrackG20, collection };
