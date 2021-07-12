module.exports = {
    checkLoggedIn: (req, res, next) => {
        if (req.user)
            return next();

        req.flash("error", "You must be Logged in to do that!");
        res.redirect("/");
    }
};