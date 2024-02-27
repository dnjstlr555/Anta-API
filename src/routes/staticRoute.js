// This route handles the URL requests if the URL's path is valid to the file system.

/*
TODO : 현재 Route에서 Controller로 메소드를 실행하고 그 결과로 return된 값을 처리함
이는 next()를 Route에서 사용해야하고, return을 통해 Route의 흐름 제어를 해야하기 때문에 그렇게 됨
원래 취지는 url 해석은 Route에서 하고, Controller에서는 그 결과를 처리하는 것이었음
다만 그렇게 하다 보니 if문이 많아져서 뭔가 안깔끔함
좀더 생각해볼것..
*/
const express = require("express");

module.exports = (controller) => {
    const router = express.Router()
    router.get("*", async (req, res, next) => {
        if (IsErrorFlagged()) {
            return next();
        }
        const decodedPath = decodeURIComponent(req.path); //Decoding the requested URL so that it can be used as a file path
        if (decodedPath == "/") { //If the path were root, send the root folder
            controller.CommonRequestHandlers.SendFolderFront(req, res, "/");
            return;
        }
        const convertedPath = await controller.ConvertPath(decodedPath);
        if (convertedPath == null) {
            //If the path were invalid, flag the error and continue to next middleware
            FlagError(404);
            return next();
        }
        const handleResult = await controller.CommonRequestHandlers.HandleFront(req, res, convertedPath); //handle the request
        if (handleResult instanceof Array && handleResult[0] == false) {
            //If the request was not valid, flag the error
            FlagError(handleResult[1]);
            return next();
        }
        return;
        //Helper functions
        function FlagError(ErrorCode) {
            res.locals.ErrorCode = ErrorCode;
        }
        function IsErrorFlagged() {
            return res.locals.ErrorCode !== undefined;
        }
    });
    router.post("*", async (req, res, next) => {
        if (IsErrorFlagged()) {
            return next();
        }
        const decodedPath = decodeURIComponent(req.path);
        const convertedPath = await controller.ConvertPath(decodedPath);
        if (convertedPath == null) {
            FlagError(404);
            return next();
        }
        const result = await controller.FileManageHandlers.SaveFile(req, res, convertedPath);
        if (result == false) {
            FlagError(500);
            return next();
        }
        function FlagError(ErrorCode) {
            res.locals.ErrorCode = ErrorCode;
        }
        function IsErrorFlagged() {
            return res.locals.ErrorCode !== undefined;
        }
    });
    return router;
};