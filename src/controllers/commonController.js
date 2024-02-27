const path = require("path");
const fs = require("fs");

module.exports = (context, model) => {
    //Returns a dictionary of functions that send the file or resource.
    //Context is the Controller object itself. 
    return {
        SendCommonFile: SendCommonFile,
        SendList: SendList,
        HandleFront: HandleFront,
        SendResource: SendResource,
        SendFolderFront: SendFolderFront
    };
    async function SendCommonFile(req, res, filePath) {
        if (Object.keys(req.headers).includes("range")) {
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
            //check if it is a valid range requested withint the file size
            //if not, send the entire file
            if (start >= videoSize || end >= videoSize) {
                res.status(416).send("Requested range not satisfiable\n" + start + " >= " + videoSize + " || " + end + " >= " + videoSize);
                return;
            }
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
    async function SendList(req, res, folderPath, toJSON=false) {
        const sharedList = model.GetSharedList();
        const contentPathPair = folderPath == "/" ? GetRootFolders(sharedList) : await GetFolderFiles(folderPath);
        const [dirs, files] = await SeperateEncodeEntries(contentPathPair);
        let formattedContents = { url: req.path, files: files, dirs: dirs };
        if(toJSON==true) {
            return formattedContents;
        }
        res.json(formattedContents);
        // Helper Functions
        function GetRootFolders(sharedList) {
            // returns sharedList's keys and values pair
            return [...Object.entries(sharedList)];
        }
        async function GetFolderFiles(folderPath) {
            // returns files in the folder
            const contents = await GetFileList(folderPath);
            return [...contents.map((i) => { return [i, path.join(folderPath, i)] })];
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
            let dirs = [], files = [];
            for (let i of arr) {
                const stats = await GetFileStat(i[1]);
                if (stats.isDirectory()) {
                    dirs.push({ name: encodeURIComponent(i[0]), stat: FilterStats(stats) });
                } else if (stats.isFile()) {
                    files.push({ name: encodeURIComponent(i[0]), stat: FilterStats(stats) });
                } else {
                    continue;
                }
            }
            return [dirs, files];
            function FilterStats(stat) {
                return {
                    size: stat.size,
                    mtime: stat.mtime,
                    birthtime: stat.birthtime,
                };
            }
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
    async function HandleFront(req, res, convertedPath) {
        //Handle the request, if the path is a directory, send the front of the directory, if the path is a file, send the file.
        const stats = await GetFileStat(convertedPath);
        if (stats == null) {
            //File was not found, flag the 404 error
            return [false, 404];
        }
        return await (stats.isDirectory() ? SendFolderFront(req, res, convertedPath) : SendCommonFile(req, res, convertedPath));
        // Helper Functions
        function GetFileStat(filePath) {
            return new Promise((resolve, reject) => {
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        if (err.code == "ENOENT") {
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
    async function SendResource(req, res, resourcePath) {
        //Returns Promise. Send the resource file in the skin folder.
        const SKIN_FOLDER = model.GetSkinFolder();
        return SendCommonFile(req, res, path.join(SKIN_FOLDER, resourcePath));
    }
    async function SendFolderFront(req, res, folderPath) {
        //Send the front of the folder, fodlerPath is real path in the system. two case:/ and /(shared folder)
        //replace <antainit> tag with the extraJson
        const file=await GetFile(path.join(model.GetSkinFolder(),"anta.html"));
        const fileText=file.toString('utf-8');
        //replace <antainit> with the extraJson
        const data=await SendList(req, res, folderPath, true);
        const replacedText=fileText.replace("<antainit>",`<script>const antainit=${JSON.stringify(data)}</script>`).replace("</antainit>","");
        //set the content type to html
        res.set("Content-Type","text/html");
        res.send(replacedText);
        return [true, null];
        // Helper Functions
        function GetFile(filePath) {
            return new Promise((resolve, reject) => {
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                });
            });
        }
    }
}