// If url was not valid, it will be handled by defaultRoute.js.
const express = require("express")

module.exports = (controller) => {
    const router = express.Router()
    router.use("*", (req, res, next) => {
        if(Object.keys(res.locals).includes("ErrorCode")) {
            res.status(res.locals.ErrorCode);
            res.send(`The URL you requested is not valid. ${req.originalUrl} ${res.locals.ErrorCode}`);
            return;
        }
        res.status(404);
        res.send(`The url were invalid. ${req.originalUrl} 404`);
    });
    return router;
}