const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const bcrypt = require("bcryptjs");

const { User } = require('./models');

passport.serializeUser((user, done) => done(null, user.username));

passport.deserializeUser(async (username, done) => {
    try {
        const user = await User.findByUsername(username);
        return done(null, user);

    } catch (err) {
        console.error(err.stack);
        return done(err);
    }
});

// Create a local Strategy to Autherize Users locally
const localStrategy = new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findByUsername(username);

        if (!user)
            return done(null, false, { message: "User not found" });

        const res = await bcrypt.compare(password, user.password);

        if (res === false)
            return done(null, false, { message: "Password does not match!" });

        return done(null, user);

    } catch (err) {
        console.error(err.stack);
        return done(err);
    }
});


passport.use('local', localStrategy);


module.exports = passport;