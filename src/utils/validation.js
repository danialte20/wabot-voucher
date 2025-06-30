function isValidUsername(text) {
    return /^[a-zA-Z0-9_]{3,}$/.test(text);
}

module.exports = { isValidUsername };
