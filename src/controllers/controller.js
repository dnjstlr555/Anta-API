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
const path=require("path");
const fs=require("fs");

class Controller {
  #model;
  #plugin;
  constructor(model, pathcallplugin) {
    this.#model = model; //model is a private property
    this.#plugin = pathcallplugin; //plugin is a private property
  }
  async SendCommonFile(req, res, filePath) {
    if(Object.keys(req.headers).includes("range")) {
      const range = req.headers.range;
      if (!range) {
          res.status(400).send("Requires Range header");
          return;
      }
      const videoPath = filePath;
      const videoSize = await GetFileSize(videoPath)
      const CHUNK_SIZE = 10 ** 6;
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
      const contentLength = end - start + 1;
      const headers = {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": contentLength,
          "Content-Type": "video/mp4",
      };
      res.writeHead(206, headers);
      const videoStream = fs.createReadStream(videoPath, { start, end });
      videoStream.pipe(res);
    } else {
      res.sendFile(filePath);
    }
    // Helper Function
    function GetFileSize(filePath) {
      return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
          if (err) {
            reject(err);
          }
          resolve(stats.size);
        });
      });
    }
  }
  SendResource(req, res, resourcePath) {
    const SKIN_FOLDER=this.#model.GetSkinFolder();
    this.SendCommonFile(req, res, path.join(SKIN_FOLDER, resourcePath));
  }
  async HandlePlugin(req, res) {
    //This function is called when the request has a query. The query is parsed and the plugin is called.
    //Find a query that matches the plugin name and call the plugin.
    const pluginNames = this.#plugin.GetPluginPaths();
    const callname = Object.keys(req.query).find((key) => pluginNames.includes(key));
    if(callname==undefined) {
      return [false, 404];
    }
    const calledPlugin = this.#plugin.GetPlugin(callname);
    const args = req.query[callname];
    let isRunSuccess;
    if(!IsAsyncFunction(calledPlugin.run)) {
      isRunSuccess=calledPlugin.run(req, res, args);
    } else {
      isRunSuccess=await calledPlugin.run(req, res, args);
    }
    if(isRunSuccess) {
      return [true, 200];
    }
    return [false, 500];
    function IsAsyncFunction(func) {
      return func.constructor.name === 'AsyncFunction';
    }
  }
  SaveFile(req, res) {
    //TODO
    this.#model.FileSave(req, res);
  }
  SendFolderFront(req, res) {
    this.SendResource(req, res, "anta.html");
  }
  ConvertPath(path) {
    return this.#model.ConvertPath(path);
  }
  async HandleFront(req, res, convertedPath) {
    //Handle the request, if the path is a directory, send the front of the directory, if the path is a file, send the file.
    const stats=await GetFileStat(convertedPath);
    if(stats==null) {
      //File was not found, flag the 404 error
      return [false, 404];
    }
    if(stats.isDirectory()) {
      this.SendFolderFront(req, res);
    } else if(stats.isFile()) {
      this.SendCommonFile(req, res, convertedPath);
    } else {
      return [false, 500];
    }
    return [true, 200];
    // Helper Functions
    function GetFileStat(filePath) {
      return new Promise((resolve,reject)=>{
        fs.stat(filePath, (err, stats) => {
          if (err) {
            if(err.code=="ENOENT") {
              resolve(null);
            } else {
              reject(err);
            }
            return;
          }
          resolve(stats);
        })
      });
    }
  }
  async SendList(req, res, folderPath) {
    const sharedList=this.#model.GetSharedList();
    const contentPathPair = folderPath=="/" ? GetRootFolders(sharedList) : await GetFolderFiles(folderPath);
    const [dirs, files] = await SeperateEncodeEntries(contentPathPair);
    let formattedContents = {url:req.path, files:files, dirs:dirs};
    res.json(formattedContents);
    // Helper Functions
    function GetRootFolders(sharedList) {
      // returns sharedList's keys and values pair
      return [...Object.entries(sharedList)];
    }
    async function GetFolderFiles(folderPath) {
      // returns files in the folder
      const contents = await GetFileList(folderPath); 
      return [... contents.map((i)=>{return [i, path.join(folderPath, i) ]})]; 
    }
    function GetFileList(folderPath) {
      return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
          if (err) {
            reject(err);
          }
          resolve(files);
        });
      });
    }
    async function SeperateEncodeEntries(arr) {
      //arr is an array of names, path pair ([name, path])
      //returns an array of [[{name:encodedName, path:path}, ...], [{name:encodedName, path:path}, ...]]
      let dirs=[], files=[];
      for(let i of arr) {
        const stats = await GetFileStat(i[1]);
        if(stats.isDirectory()) {
            dirs.push({name:encodeURIComponent(i[0]), stat: stats});
        } else if(stats.isFile()) {
            files.push({name:encodeURIComponent(i[0]), stat: stats});
        } else {
            continue;
        }
      }
      return [dirs, files];
    }
    function GetFileStat(filePath) {
      return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                reject(err);
            }
            resolve(stats);
            });
        });
    }
  }
}
module.exports = Controller;