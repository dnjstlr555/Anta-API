// This route handles the URL requests if URL have specific parameters to call backend functions.

/*
유저의 URL 요청 시나리오:
1. (여기서구현)/?resource="js/music.js" : skin으로 지정된 경로에 있는 music.js 파일을 읽어서 반환한다. v (완료)
2. (여기서구현)/?"<plugin name>"="<something>"&<something2>="<something3>" : plugin을 호출, something은 첫번쨰 인자로 나머지 something2, something3등은 필요하면 dict 형태로 두번째 인자로 넘긴다.
  ex) /?"consub"="/mv/koenokatachi.smi"
  ex) /?"zip"="/mv"
3. POST /mv : mv 폴더에 전송된 파일을 저장한다. 
4. GET /mv : mv 폴더의 front를 전송한다.
5. GET /mv?list="ascend" : mv 폴더의 list JSON을 내림차순으로 전송한다. v (완료)
6. GET /mv/koenokatachi.smi : mv 폴더의 koenokatachi.smi 파일을 전송한다. 
*/
const express = require("express")

module.exports = (controller) => {
  const router = express.Router()
  router.get("*", async (req, res, next) => {
      if (Object.keys(req.query).length === 0) {
        //If there is no query, continue to static route
        return next();
      }
      if (Object.keys(req.query).includes("resource")) {
        //If the query includes "resource", send the skin resources
        controller.SendResource(req, res, req.query.resource);
        return;
      }
      if(Object.keys(req.query).includes("list")) {
        //If the query includes "list", send the folder list or root list depends on situation
        if(req.path=="/") {
          controller.SendList(req, res, "/"); //Send root folder lists
        } else {
          const decodedPath=decodeURIComponent(req.path);
          const convertedPath=await controller.ConvertPath(decodedPath);
          if(convertedPath==null) {
            //If the path were invalid, flag the error and continue to next middleware
            FlagError(404);
            return next();
          }
          controller.SendList(req, res, convertedPath); //Send folder lists
        }
        return;
      }
      const result = await controller.HandlePlugin(req, res);
      if(result[0]==false) {
        //If the plugin's result is false,  means the plugin has failed or the plugin is not found. Flag the error and continue to next middleware
        FlagError(result[1]);
        return next();
      } else {
        return;
      }
      function FlagError(ErrorCode) {
        res.locals.ErrorCode=ErrorCode;
      }
  });
  return router;
};