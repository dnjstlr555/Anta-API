const express = require("express");
const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = (model) => {
    const router = express.Router();
    router.use(async (req, res, next) => {
        if (process.env.NODE_ENV === "test") {
            return next();
        }
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/login');
        }
        try {
            const publicKey = await fs.promises.readFile(model.settings.sslCert);
            const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }); //decoded contains the payloads
            return next();
        } catch (error) {
            console.log(error);
            res.status(401).json({ error: 'Invalid token' });
        }
    });
    return router;
};