const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, default: "paul" },
  password: { type: String, required: true, default: "123" },
  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
