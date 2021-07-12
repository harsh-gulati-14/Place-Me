const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	username: String,
	password: String,
	name: String,
	email: String,
	initcode: {
		code: String,
		lang: String
	},
	compiledCodes: [String],
	chats: [{
		to: String,	
		chat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "chat"
		},
		unreadMessages: Number
	}],
	groups: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "group"
	}]
});

userSchema.statics.findByUsername = function (username) {
	return this.findOne({ username });
};

module.exports = mongoose.model("user", userSchema);