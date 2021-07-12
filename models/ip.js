const mongoose = require("mongoose");

const ipSchema = mongoose.Schema({
	ip: String
});

module.exports = mongoose.model("ip", ipSchema);