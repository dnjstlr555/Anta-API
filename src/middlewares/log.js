const express = require("express");

const router = express.Router();
router.use((req, res, next) => {
    //if it is testing, don't log
    if (process.env.NODE_ENV === "test") {
        return next();
    }
    console.log(`[${new Date().toISOString()}] - IP : ${req.ip} - URL : ${req.originalUrl} - METHOD : ${req.method}`); // - BODY : ${JSON.stringify(req.body)}
    next()
})
module.exports = router;