// This route handles the URL requests if URL have specific parameters to call backend functions.

/*
유저의 URL 요청 시나리오:
1. (여기서구현)/?resource="js/music.js" : skin으로 지정된 경로에 있는 music.js 파일을 읽어서 반환한다. v (완료)
2. (여기서구현)/?"<plugin name>"="<something>"&<something2>="<something3>" : plugin을 호출, something은 첫번쨰 인자로 나머지 something2, something3등은 필요하면 dict 형태로 두번째 인자로 넘긴다.
  ex) /?"consub"="/mv/koenokatachi.smi"
  ex) /?"zip"="/mv"
3. (여기서구현) GET /mv?delete="koenokatachi.smi" : mv 폴더의 koenokatachi.smi 파일을 삭제한다.
4. (여기서구현) GET /mv?rename="koenokatachi.smi"&to="koe.smi" : mv 폴더의 koenokatachi.smi 파일을 rename한다.
*/
const express = require("express")

module.exports = (controller) => {
    const router = express.Router()
    router.get("*", async (req, res, next) => {
        const queryKeys = Object.keys(req.query);
        if (queryKeys.length === 0) {
            //If there is no query, continue to static route
            return next();
        }
        if (queryKeys.includes("resource")) {
            //If the query includes "resource", send the skin resources
            controller.CommonRequestHandlers.SendResource(req, res, req.query.resource);
            return;
        }
        if (queryKeys.includes("list")) {
            //If the query includes "list", send the folder list or root list depends on situation
            if (req.path == "/") {
                controller.CommonRequestHandlers.SendList(req, res, "/"); //Send root folder lists
                return;
            }
            const convertedPath = await ConvertPath();
            if (convertedPath == false) {
                return next();
            }
            controller.CommonRequestHandlers.SendList(req, res, convertedPath); //Send folder lists
            return;
        }
        if (queryKeys.includes("delete")) {
            //If the query includes "delete", delete the file
            const convertedPath = await ConvertPath();
            if (convertedPath == false) {
                return next();
            }
            const result = await controller.FileManageHandlers.DeleteFile(req, res, convertedPath, req.query.delete);
            if (result == false) {
                FlagError(500);
                return next();
            }
            return;
        }
        if (queryKeys.includes("rename")) {
            //If the query includes "rename", rename the file
            const convertedPath = await ConvertPath();
            if (convertedPath == false || req.query.to == undefined) {
                return next();
            }
            controller.FileManageHandlers.RenameFile(req, res, convertedPath, req.query.rename, req.query.to);
            return;
        }
        const result = await controller.HandlePlugin(req, res);
        if (result[0] == false) {
            //If the plugin's result is false,  means the plugin has failed or the plugin is not found. Flag the error and continue to next middleware
            FlagError(result[1]);
            return next();
        } else {
            return;
        }
        // Helper Functions
        function FlagError(ErrorCode) {
            res.locals.ErrorCode = ErrorCode;
        }
        async function ConvertPath() {
            //Convert path and validate the path. 
            const decodedPath = decodeURIComponent(req.path);
            const convertedPath = await controller.ConvertPath(decodedPath);
            if (convertedPath == null) {
                //If the path were invalid, flag the error and continue to next middleware
                FlagError(404);
                return false;
            }
            return convertedPath;
        }
    });
    return router;
};