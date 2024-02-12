// This route handles the URL requests if the URL's path is valid to the file system.

/*
유저의 URL 요청 시나리오:
1. /?resource="js/music.js" : skin으로 지정된 경로에 있는 music.js 파일을 읽어서 반환한다.
2. /?"<plugin name>"="<something>"&<something2>="<something3>" : plugin을 호출, something은 첫번쨰 인자로 나머지 something2, something3등은 필요하면 dict 형태로 두번째 인자로 넘긴다.
  ex) /?"consub"="/mv/koenokatachi.smi"
  ex) /?"zip"="/mv"
3. (여기서구현)POST /mv : mv 폴더에 전송된 파일을 저장한다. 
4. (여기서구현)GET /mv : mv 폴더의 front를 전송한다. v (완료)
5. (여기서구현)GET /mv?list="ascend" : mv 폴더의 list JSON을 내림차순으로 전송한다. v (완료) -> 순서 구현 안함
6. (여기서구현)GET /mv/koenokatachi.smi : mv 폴더의 koenokatachi.smi 파일을 전송한다. v (완료)
*/
const express = require("express");

module.exports = (controller) => {
  const router = express.Router()
  router.get("*", async (req, res, next) => {
    if(IsErrorFlagged()) {
      return next();
    }
    const decodedPath=decodeURIComponent(req.path); //Decoding the requested URL so that it can be used as a file path
    if(decodedPath=="/") { //If the path were root, send the root folder
      controller.SendFolderFront(req, res);
      return;
    }
    const convertedPath=await controller.ConvertPath(decodedPath);
    if(convertedPath==null) {
      //If the path were invalid, flag the error and continue to next middleware
      FlagError(404);
      return next();
    }
    const handleResult=await controller.HandleFront(req, res, convertedPath); //handle the request
    if(handleResult[0]==false) {
      //If the request was not valid, flag the error
      FlagError(handleResult[1]);
      return next();
    }
    return;
    //Helper functions
    function FlagError(ErrorCode) {
      res.locals.ErrorCode=ErrorCode;
    }
    function IsErrorFlagged() {
      return res.locals.ErrorCode!==undefined;
    }
  });
  router.post("*", async (req, res, next) => {
    const convertedPath=await controller.ConvertPath(req.path);
    if(convertedPath==null) {
      controller.FlagError(404);
      next();
      return;
    }
    controller.SaveFile(req, res);
  });
  return router;
};