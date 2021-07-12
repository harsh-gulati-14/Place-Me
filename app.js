// Path
const path = require("path");

// Express
const express = require("express");

// Sockets
const socketio = require("socket.io");
const http = require("http");

// Passport: Cookie Parser, Express-Session
const cp = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passportSocketIo = require("passport.socketio");


// Connect Flash
const flash = require("connect-flash");

// Passport
const Passport = require("./passport.js");
// Connect to Database
const mongoose = require("./db");


// --------------------
//    INITIALIZATION
// --------------------

// Create the Express App
const app = express();
// Extract Server from app
const server = http.Server(app);
// Initialize io
const io = socketio(server);

// Set EJS as View Engine
app.set("view engine", "ejs");

//====================
//    MIDDLEWARES
//====================

// Parse Request's Body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Initialize Express-session
app.use(cp(process.env.COOKIE_SECRET));

// Session Store
const sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });
app.use(session({
    secret: 'putanythinghere',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

// Initialize Passport
app.use(Passport.initialize());
app.use(Passport.session());

// Initialize Flash
app.use(flash());


// MOUNTING STATIC FILES
app.use("/", express.static(path.join(__dirname, "public")));


// Add user to response's locals
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});


// USING ROUTERS
app.use("/", require("./routes")(io));



// ====================
//      Sockets
// ====================

// Authentication
const authenticator = passportSocketIo.authorize({
    cookieParser: cp,
    secret: 'putanythinghere',
    store: sessionStore,
});

// Use Authenticator to authenticate users on all three Namespaces
io.of("/chats").use(authenticator);
io.of("/groups").use(authenticator);

// Add Event Listeners to all Namespaces
require("./socket/chats")(io);
require("./socket/groups")(io);


// Listen at PORT specified in CONFIG
server.listen( process.env.PORT || 3000 )