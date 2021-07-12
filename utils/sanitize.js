// HTML Sanitizer
const sanitizeHTML = require("sanitize-html");

const allowedTags = ["b", "i", "br", "a", "strong", "em"];

module.exports = {
    sanitizeMessage: message => sanitizeHTML(message, { allowedTags }).trim()
};