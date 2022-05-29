const mongoose = require("mongoose");

const pangolinSchema = new mongoose.Schema({
  title: String,
  role: String,
  image: String,
  content: String,
  createdOn: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Pangolin", pangolinSchema);
