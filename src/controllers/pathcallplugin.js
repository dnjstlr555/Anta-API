/*
Plugin은 컨트롤러의 역할을 한다.
먼저 plugin 폴더에 있는 모든 폴더를 읽고, 각 폴더에 있는 index.js 파일을 읽어서 plugin으로 등록한다.
index.js에는 외부에서 호출될 이름과, 호출시 (req, res, args)를 받아서 실행할 함수를 정의한다.
Controller의 일종이기 때문에 반드시 response를 한 후 종료되어야 한다. 
다만 에러가 있을경우 false를 반환하기만 하면 response를 하지 않아도 된다.
*/
const path = require("path");
const fs = require("fs");

class PathCallPlugin {
    #model;
    #plugins;
    constructor(model) {
        this.#plugins = [];
        this.#model=model;
        this.#LoadPlugins();
    }
    #LoadPlugins() {
        const pluginPath = path.join(__dirname, "../plugins");
        const pluginFolders = fs.readdirSync(pluginPath);
        for (const pluginFolder of pluginFolders) {
            const pluginIndex = path.join(pluginPath, pluginFolder, "index.js");
            if (fs.existsSync(pluginIndex)) {
                const element = require(pluginIndex)(this.#model);
                //init and test functions are optional
                if(element.init!==undefined) {
                    element.init();
                }
                if(element.test!==undefined) {
                    const testResult=element.test();
                    if(testResult==false) {
                        console.log(`Plugin ${element.name} is not loaded because of test failure.`);
                        continue;
                    }
                }
                if(element.run===undefined || element.name===undefined || element.callpath===undefined) {
                    console.log(`Plugin ${element.name} is not loaded because of invalid index.js`);
                }
                this.#plugins.push(element);
                console.log(`Plugin ${element.name} is loaded`);
            }
        }
    }
    GetPluginNames() {
        return this.#plugins.map((plugin) => plugin.name);
    }
    GetPluginPaths() {
        return this.#plugins.map((plugin) => plugin.callpath);
    }
    GetPlugin(callpath) {
        return this.#plugins.find((plugin) => plugin.callpath === callpath);
    }
}
module.exports = PathCallPlugin;