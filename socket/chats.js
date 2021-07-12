const { Chat, User } = require("../models");
const { sanitizeMessage } = require("../utils/sanitize");

module.exports = (io) => {
    const nsp = io.of("/chats");               //creating namespace
    nsp.on("connection", socket => {

        socket.on("data", async ({ url, username }) => {
            
            socket.username = username;

            socket.chatId = url.split("/")[2];

            const user = await User.findByUsername(socket.username);
            
            const userChat = user.chats.find(
                chat => chat.chat.equals(socket.chatId)
            );
            
            socket.receiver = { username: userChat.to };

            socket.join(socket.chatId);             //joining room


            try {
                const chat = await Chat.findById(socket.chatId);

                socket.emit("old messages", chat.messages);
                socket.emit("get initcode", chat.initcode);

                userChat.unreadMessages = 0;
                await user.save();

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
                await Chat.update(
                    { _id: socket.chatId },
                    { $push: { messages: message } }
                );

                nsp.to(socket.chatId).emit("new message display", message);
            
                const socketIds = Object.keys(nsp.in(socket.chatId).sockets);
                const sockets = socketIds.map(
                    id => nsp.in(socket.chatId).sockets[id]
                );

                if (!sockets.find(socket => socket.username === socket.receiver.username)) {
                    const receiver = await User.findByUsername(socket.receiver.username);
                    ++receiver.chats.find(
                        chat => chat.chat.equals(socket.chatId)
                    ).unreadMessages;

                    await receiver.save();
                }

            } catch (err) {
                console.error(err.stack);
                throw err;
            }

        });

        socket.on("set initcode", async data => {
            try{
                await Chat.update(
                    { _id: socket.chatId },
                    { $set: {initcode: {code: data.code, lang: data.lang}} }
                );
            } catch (err) {
                console.error(err.stack);
                throw err;
            }
        });

        socket.on("update lang", async data => {
            console.log("update lang " + data);
            try{
                await Chat.update(
                    { _id: socket.chatId },
                    { $set: {initcode: {lang: data}} }
                );
            } catch (err) {
                console.error(err.stack);
                throw err;
            }
            socket.to(socket.chatId).broadcast.emit("change lang", data);
        });

        socket.on("add link", async data => {
           try{
                await Chat.update(
                    { _id: socket.chatId },
                    { $push: {compiledCodes: data} }
                );
            } catch (err) {
                console.error(err.stack);
                throw err;
            }
        });

        socket.on("compile code", username => {
            socket.to(socket.chatId).broadcast.emit("compiling", username);
        });

        socket.on("update", data => {
            console.log( "Handler for .keypress() called." );
            socket.to(socket.chatId).broadcast.emit("updatecode", data);
        });

        socket.on("update input", data => {
            socket.to(socket.chatId).broadcast.emit("update inputbox", data);
        });

        socket.on("change output", data => {
            socket.to(socket.chatId).broadcast.emit("update outputbox", data);
        });

        socket.on("typed", username => {
            socket.to(socket.chatId).broadcast.emit("typing", username);
        });
    });
};