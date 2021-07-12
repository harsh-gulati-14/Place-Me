const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    messages: [{
        sender: String,
        body: String,
        for: [String]  
    }],
	initcode: {
		code: String,
		lang: String
	},
	compiledCodes: [{
        username: String,
        link: String 
    }]
});

module.exports = mongoose.model("chat", chatSchema);