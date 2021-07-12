const route = require("express").Router();
const { User } = require("../models");
const { checkLoggedIn } = require("../utils/auth");
var request = require('request');


//====================
//       ROUTES
//====================

route.get("/", checkLoggedIn, (req, res) => {
    res.render("editor/index", {
        success: req.flash("success"),
        error: req.flash("error")
    });
});

route.get("/info", async (req, res) => {
    let user = await User.findByUsername(req.user.username);
    res.send({ user });
});

route.post("/save", async (req, res) => {
    let user = await User.findByUsername(req.user.username);
    Object.assign( user.initcode, {
        code: req.body.code,
        lang: req.body.lang
    });
    await user.save();
    res.send('success');
});

route.get("/details", checkLoggedIn, async (req, res, next) => {
    try {
        res.render("editor/details");
    } catch (err) {
        console.error(err.stack);
        res.sendStatus(500);
    }
});

route.post('/compiler', (req, res) => { 
    console.log(req.body.source);
   var CLIENT_SECRET = cead0c515f25c09c6abfe29c5608fbebf4777811 ;
    var requ ={
      url: "https://api.hackerearth.com/v3/code/run/",
      method: 'POST',
      form: {
        'client_secret': cead0c515f25c09c6abfe29c5608fbebf4777811,
        'async': 0,
        'source': req.body.source,
        'lang': req.body.lang,
        'input': req.body.input,
        'time_limit': 5,
        'memory_limit': 262144,
      }
    };

    request(requ, async (err, resp, body) => {
        body = JSON.parse(body);
        var user = await User.findByUsername(req.user.username);
        user.compiledCodes.push(body.web_link);
        await user.save();
        res.send(body);
    });
});

module.exports = route;