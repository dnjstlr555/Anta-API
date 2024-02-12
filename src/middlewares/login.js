const express = require("express");

const router = express.Router();
router.use((req, res, next) => {
    //TODO
    next()
})
module.exports = router;