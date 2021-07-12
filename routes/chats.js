const { User,/* Bot, */Chat } = require("../models");

const { checkLoggedIn } = require("../utils/auth");


//====================
//       ROUTES 19BCT0210 HARSH GULATI
//====================

module.exports = (io) => {
    const route = require("express").Router();

    route.get("/", checkLoggedIn, async (req, res) => {
        try {
            const userChats = req.user.chats.map(chat => ({
                name: chat.to,
                link: `/chats/${chat.chat}/chat`,
                unreadMessages: chat.unreadMessages
            }));

            const user = await req.user.populate("groups").execPopulate();

            const groupChats = user.groups.map(group => ({
                name: group.name,
                link: `/groups/${group.id}/chat`,
                unreadMessages: group.members.find(member => member.username === user.username).unreadMessages
            }));

            const chats = [...userChats, ...groupChats];


            res.set("Cache-Control", "no-store");

            res.render("chats", {
                chats,
                success: req.flash("success"),
                error: req.flash("error")
            });

        } catch (err) {
            console.error(err.stack);
            res.sendStatus(500);
        }
    });

    const addChat = async (user, receiver, res) => {
        const chats = user.chats.filter(
            chat => chat.to === receiver.username
        );

        if (chats.length !== 0) {
            return res.redirect(`/chats/${chats[0].chat}/chat`);
        }

        const code = "#include <stdio.h>\nint main(void) {\n\t// your code goes here\n\treturn 0;\n}";
        const chat = await Chat.create({ messages: [] , initcode: {code: code, lang: "C"}, compiledCodes: []});

        user.chats.push({
            to: receiver.username,
            chat,
            unreadMessages: 0
        });

        receiver.chats.push({
            to: user.username,
            chat,
            unreadMessages: 0
        });

        await Promise.all([user.save(), receiver.save()]);

        return chat;
    };

    route.post("/", checkLoggedIn, async (req, res) => {
        try {
            let receiver = await User.findByUsername(req.body.username);

            if (receiver.username === req.user.username) {
                req.flash("error", `Can't start chat with yourself`);
                return res.redirect("/chats/new");
            }
            const chat = await addChat(req.user, receiver, res);

            return res.redirect(`/chats/${chat.id}/chat`);

        } catch (err) {
            console.error(err.stack);
            res.sendStatus(500);
        }
    });


    route.get("/new", checkLoggedIn, (req, res) => {
        res.render("chat/new", {
            success: req.flash("success"),
            error: req.flash("error")
        });
    });

    route.get("/:chatId", checkLoggedIn, async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if (chat === null)
            return next();

        res.render("chat/details", {
            chatId: chat.id,
            codelinks: chat.compiledCodes
        });

        } catch (err) {
            console.error(err.stack);
            res.sendStatus(500);
        }
    });

    route.get("/:chatId/chat", checkLoggedIn, async (req, res, next) => {
        try {
            const chat = req.user.chats.find(
                chat => chat.chat.equals(req.params.chatId)
            );

            if (!chat) {
                return next();
            }

            res.render("chat", { title: chat.to, chatId: req.params.chatId });
            
        } catch (err) {
            console.error(err.stack);
            res.sendStatus(500);
        }
    });


    return route;
};