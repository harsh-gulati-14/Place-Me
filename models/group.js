// Require Mongoose
const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
    name: String,
    members: [{
        username: String,
        unreadMessages: Number
    }],
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat"
    }
});

groupSchema.statics.findByName = function (name) {
    return this.findOne({ name });
};

module.exports = mongoose.model("group", groupSchema);