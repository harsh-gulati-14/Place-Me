const fs = require("fs");
const bcrypt = require("bcryptjs");

const route = require("express").Router();
const Passport = require("passport");

const { User} = require("../models");
const { checkLoggedIn } = require("../utils/auth");


//====================19BCT0210 HARSH GULATI

route.post("/signup", async (req, res, next) => {
    try {
        let user = await User.findByUsername(req.body.username);
        console.log("new user : "+ user);

        if (user !== null) {
            req.flash("error", `Username ${req.body.username} already in use!`);
            return res.redirect("/");
        }

        const hash = await bcrypt.hash(req.body.password, 5);
        const initcode = "#include <stdio.h>\nint main(void) {\n\t// your code goes here\n\treturn 0;\n}";

        user = await User.create({
            username: req.body.username,
            password: hash,
            name: req.body.firstName + " " + req.body.lastName,
            email: req.body.email,
            initcode: {
                code: initcode,
                lang: "C"
            },
            chats: [],
            groups: [],
            compiledCodes: [],
        });

        req.flash("success", "Successfully Signed Up!");

        Passport.authenticate("local", {
            successRedirect: "/chats",
            failureRedirect: "/"    
        })(req, res, next);

    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

route.post("/login", (req, res, next) => {
    Passport.authenticate("local", (err, user) => {
        if (err)
            return next(err);

        if (!user) {
            req.flash("error", "Invalid Credentials!");
            return res.redirect("/");
        }

        req.logIn( user, err => {
            if (err)
                return next(err);

            req.flash("success", `Welcome back ${user.username}!`);
            return res.redirect("/chats");
        });

    })(req, res, next);
});

route.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Thank you for using PlaceMe.....!!");
    res.redirect("/");
});

module.exports = route;