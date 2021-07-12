const mongoose = require("mongoose");

mongoose
    .connect(`mongodb+srv://dbtrial:dbtrial@cluster0.suq55.mongodb.net/sleeptrial?retryWrites=true&w=majority`)
    .then(() => {
        console.log("Database Ready for use!");
    })
    .catch(err => {
        console.error("Error connecting to Database!!");
        console.error(err.stack);
        process.exit(1);
    });

module.exports = mongoose;