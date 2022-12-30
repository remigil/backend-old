// import ?mongoose from "mongoose";
require("../../config/mongo");
const mongoose = require("mongoose");
// const pagination = require('mongoose-aggregate-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
// import pagination from 'mongoose-aggregate-paginate-v2'
const collection = {
  id_user: String,
  latitude: Number,
  longitude: Number,
  id_officer: Number,
  status_login: Number,
  date: Date,
  dateOnly: String,
  photo_officer: String, //[foto petugas]
  pam_officer: String, //[foto petugas]
  photo_officer_telp_biasa: String, //[foto petugas]
  name_account: String,
  name_officer: String,
  rank_officer: String,
  name_country: String, //delegasi
  photo_country: String, //foto delegasi
  name_team: String, // [ketua tim]
  vip: String, // [nama vip]
  nrp_user: String,
  handphone: String,
  no_vehicle: String, // [plat nomor]
  type_vehicle: String, // ["motor"]
  fuel_vehicle: String,
  back_number_vehicle: String,
  bawa_penumpang: Number,
  color_marker: String,
  polda_id: Number,
};
const DocumentSchema = mongoose.Schema(collection, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  collection: "trackG20Update",
});
DocumentSchema.plugin(aggregatePaginate);
const TrackG20Update = mongoose.model("TrackG20Update", DocumentSchema);

module.exports = { TrackG20Update, collection };
