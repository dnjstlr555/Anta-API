/*
controller.js: model을 사용해 유저의 요청에 따라 적절한 response를 반환하는 메소드 구현

Controller 작동 매커니즘
유저의 URL 요청 시나리오에 따라 적절한 Method를 호출한다.

유저의 URL 요청 시나리오:
1. /?resource="js/music.js" : skin으로 지정된 경로에 있는 music.js 파일을 읽어서 반환한다.
2. /?"<plugin name>"="<something>"&<something2>="<something3>" : plugin을 호출, something
  ex) /?"convsub"="/mv/koenokatachi.smi"
  ex) /?"zip"="/mv"
3. POST /mv : mv 폴더에 전송된 파일을 저장한다.
4. GET /mv : mv 폴더의 front를 전송한다.
5. GET /mv?list="ascend" : mv 폴더의 list JSON을 내림차순으로 전송한다.
6. GET /mv/koenokatachi.smi : mv 폴더의 koenokatachi.smi 파일을 전송한다. 
7. GET / : root 폴더의 front를 전송한다.

필요한 메소드
1. SendCommonFile(req, res, path) : path에 있는 파일을 읽어서 res에 전송한다. 영상 파일 또한 지원한다. path는 절대경로이다.
2. SendResource(req, res, resourcePath) : skin 폴더 내부의 파일을 path에 맞게 읽고 CommonFileSend를 호출한다. path는 url에서 parse 하며 상대 경로이다.

3. HandlePlugin(req, res) : plugin을 호출한다. url을 parse하며 plugin은 string, args는 dict이다.

4. SaveFile(req, res) : express-fileupload를 사용해 req에 있는 파일을 path에 저장한다. path는 상대경로이다. 

5. SendFolderFront(req, res) : 폴더의 Front를 전송한다. ResourceSend를 호출한다.
6. ConvertPath(path) : Model을 참조해 Path를 변환해 실제 절대 경로로 반환한다. path는 상대경로이다.
7. HandleFront(req, res, convertedPath) : Path를 변환한뒤 체크하고 디렉토리가 있는지 확인하고 있다면 FolderFrontSend를 호출한다.

8. SendList(req, res, path) : Url을 parse하고 Model을 참조해 파일 내용 list를 반환한다. list는 JSON 형태이다.
*/

const CommonRequestHandlers = require("./commonController");
const FileManageHandlers = require("./filemanageController");
const PluginController=require('./pluginController');

class Controller {
    #model;
    #plugin;
    constructor(model) {
        this.#model = model;
        this.#plugin = new PluginController(model);
        this.CommonRequestHandlers = CommonRequestHandlers(this, this.#model) //Construct the file senders
        this.FileManageHandlers = FileManageHandlers(this, this.#model) //Construct the file managers
    }
    async HandlePlugin(req, res) {
        return await this.#plugin.HandlePlugin(req, res);
    }
    ConvertPath(path) {
        return this.#model.ConvertPath(path);
    }
}
module.exports = Controller;