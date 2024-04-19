const express = require("express");
const jwt = require('jsonwebtoken');
const fs = require('fs');

module.exports = (model) => {
    const router = express.Router();
    router.use(async (req, res, next) => {
        if (process.env.NODE_ENV === "test" || model.settings.useAuth === false) {
            return next();
        }
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/login');
        }
        try {
            const publicKey = await fs.promises.readFile(model.settings.jwtRSAPublicKeyPath);
            const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }); //decoded contains the payloads
            if(Object.keys(decoded).includes("changePW") && decoded.changePW) return res.redirect("/changepw");
            if(!model.users.ExistUser(decoded.userId)) return res.redirect('/login');
            return next();
        } catch (error) {
            res.clearCookie('token');
            res.redirect('/login');
        }
    });
    return router;
};