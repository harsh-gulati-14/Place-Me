const { Chat, Group } = require("../models");
const { sanitizeMessage } = require("../utils/sanitize");

module.exports = io => {
    const nsp = io.of("/groups");
    nsp.on("connection", socket => {
        
        socket.on("data", async ({ url, username }) => {
            socket.username = username;

            socket.groupId = url.split("/")[2];

            socket.join(socket.groupId);

            try {
                const group = await Group.findById(socket.groupId).populate("chat").exec();

                socket.emit("old messages", group.chat.messages);
                socket.emit("get initcode", group.chat.initcode);

                group.members.find(
                    ({ username }) => username === socket.username
                ).unreadMessages = 0;

                await group.save();

            } catch (err) {
                console.error(err.stack);
                throw err;
            }
        });


        socket.on("new message", async text => {
            text = sanitizeMessage(text);

            if (text === "")
                return;

            const message = {
                sender: socket.username,
                body: text,   
                for: []
            };

            try {
                const group = await Group.findById(socket.groupId);
            
                await Chat.update(
                    { _id: group.chat },
                    { $push: { messages: message } }
                );

                nsp.to(socket.groupId).emit("new message display", message);

                const socketIds = Object.keys(nsp.in(socket.groupId).sockets);
                const sockets = socketIds.map(
                    id => nsp.in(socket.groupId).sockets[id].username
                );

                group.members.forEach(member => {
                    if (sockets.indexOf(member.username) === -1) {
                        ++member.unreadMessages;
                    }
                });
                await group.save();

            } catch (err) {
                console.error(err.stack);
                throw err;
            }

        });

        socket.on("update lang", async data => {
            console.log("update lang " + data);
            try{
                const group = await Group.findById(socket.groupId);
                await Chat.update(
                    { _id: group.chat },
                    { $set: {initcode: {lang: data}}} 
                );
            } catch (err) {
                console.error(err.stack);
                throw err;
            }
            socket.to(socket.groupId).broadcast.emit("change lang", data);
        });

        socket.on("set initcode", async data => {
            try{
                const group = await Group.findById(socket.groupId);
                await Chat.update(
                    { _id: group.chat },
                    { $set: {initcode: {code: data.code, lang: data.lang}}} 
                );
            } catch (err) {
                console.error(err.stack);
                throw err;
            }
        });

        socket.on("add link", async data => {
            try{
                const group = await Group.findById(socket.groupId);
                await Chat.update(
                    { _id: group.chat },
                    { $push: {compiledCodes: data}} 
                );
            }catch (err) {
                console.error(err.stack);
                throw err;
            } 
        });

        socket.on("compile code", data => {
            socket.to(socket.groupId).broadcast.emit("compiling", data);
        });

        socket.on("update", data => {
            socket.to(socket.groupId).broadcast.emit("updatecode", data);
        });

        socket.on("update input", data => {
            socket.to(socket.groupId).broadcast.emit("update input", data);
        });

        socket.on("change output", data => {
            socket.to(socket.groupId).broadcast.emit("update outputbox", data);
        });

        socket.on("typed", username => {
            socket.to(socket.groupId).broadcast.emit("typing", username);
        });
    });
};