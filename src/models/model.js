const fs = require('fs');
const os = require('os');
const path = require('path');

const essentialConfig = require('./essentialConfig');
const CURRENT_DIR = __dirname.split(/\\|\//).slice(0, -1).join("/");

class Model {
    #customModels;
    #users;
    constructor(sharedPath="./shared.cfg", configPath="./general.cfg") {
        this.settings=this.#ConstructSettings(sharedPath, configPath);
        this.#customModels={}; //Custom models for plugins that can save any data during the server is running
        this.#users=this.#ConstructUsers();
    }
    #ConstructSettings(sharedPath=null, configPath=null) {
        /*
        Construct the settings object
        1.Check valid paths 
        2.Load configs from raw object format
        3.Validate configs and edit if necessary -> integrate plugin configs
        4.Merge configs into one object
        5.Export the necessary configs if paths were invalid
        returns the settings object
        */
        let settings = {};
        // Check valid paths
        let isSharedValid = sharedPath !== null && fs.existsSync(sharedPath);
        let isConfigValid = configPath !== null && fs.existsSync(configPath);
        // Validate configs and edit if necessary
        let shared = isSharedValid ? ValidateShared(ParseConfig(sharedPath)) : {};
        let general = isConfigValid ? ValidateGeneral(ParseConfig(configPath)) : essentialConfig;
        // TODO : integrate plugin configs
        // Merge configs into one object
        settings = Object.assign(settings, {sharedList:shared});
        settings = Object.assign(settings, general);
        // Export the necessary configs if paths were invalid
        if(!isSharedValid) {
            const defaultQuoteOnShared = `#The left side of '=' is the name of the folder you will share, the right side is the path to the folder on your computer
#You can add as many folders as you want, just make sure to follow the same format`;
            let file = defaultQuoteOnShared + os.EOL;
            for(let i of Object.keys(shared)) {
                file += i + "=" + shared[i] + os.EOL;
            }
            //if the folder is not exist, create it
            if(!fs.existsSync(path.dirname(configPath))) {
                fs.mkdirSync(path.dirname(configPath), {recursive:true});
            }
            fs.writeFileSync(sharedPath, file);
        }
        if(!isConfigValid) {
            let file = "";
            for(let i of Object.keys(general)) {
                file += i + "=" + general[i] + os.EOL;
            }
            //if the folder is not exist, create it
            if(!fs.existsSync(path.dirname(configPath))) {
                fs.mkdirSync(path.dirname(configPath), {recursive:true});
            }
            fs.writeFileSync(configPath, file);
        }
        return settings;

        // Helper functions
        // Load configs from raw object format
        function ParseConfig(filePath=null) {
            /*
            Parse config entries from the file path

            file format:
            [Visible Name]=[Real Path] (newline)

            returns an object in the format:
            {[Visible Name]=[Real Path]}
            */
            if(filePath == null || fs.existsSync(filePath) == false) return null;
            let folders = {};
            let file = fs.readFileSync(filePath, 'utf8');
            let lines = file.split(/\r?\n/);
            for (let i of lines) {
                if (i.length <= 0 || !i.includes("=") || i[0]=="#") continue;
                let split = i.split("=");
                if (split.length != 2) continue;
                folders[split[0]] = split[1];
            }
            return folders;
        }
        function ValidateShared(cfg) {
            for(let i in cfg) {
                if(!fs.existsSync(cfg[i])) delete cfg[i];
            }
            return cfg;
        }
        function ValidateGeneral(cfg) {
            //check entries from essentialConfig exits and valid, if not use default one instead
            let essential = essentialConfig;
            for(let i of Object.keys(essential)) {
                if(cfg[i] == null) {
                    cfg[i] = essential[i];
                }
            }
            //check all entries and cast to correct type according to the essentialConfig
            //if the entry is not in the essentialConfig, it will be ignored
            for(let i of Object.keys(cfg)) {
                if(essential[i] != null) {
                    cfg[i] = autoCast(cfg[i], typeof essential[i]);
                }
            }
            function autoCast(value, referType) {
                if(referType == null) return value;
                if(referType == "number") return Number(value);
                if(referType == "boolean") return value=="true";
                return value;
            }
            return cfg;
        }
    }
    #ConstructUsers() {
        // TODO : Placeholder
        return {
        };
    }
    async ConvertPath(fakePath) {
        /*
        example : path = /mv/koenokatachi.smi or mv/koenokatachi.smi 
        returns : /home/user/movie/koenokatachi.smi (combined path of sharedList and path)
        does not check if the file exists or not.
        */
        const {IsSharedEntry, ConvertEntry, IsValidEntryFolder} = Helper(this.settings);
        if(fakePath == null) return null;
        if(fakePath[0] == '/') fakePath = fakePath.slice(1); // remove first '/'
        const pathSplited = fakePath.split('/');
        if(!IsSharedEntry(pathSplited[0])) return null; // if there is no shared entry or the entry is invalid, return null
        const isValidEntry=await IsValidEntryFolder(pathSplited[0]);
        if(!isValidEntry) return null;
        return path.join(ConvertEntry(pathSplited[0]), ...pathSplited.slice(1));

        function Helper(settings) {
            function IsSharedEntry(entry) {
                return Object.keys(settings.sharedList).includes(entry);
            }
            function ConvertEntry(entry) {
                return settings.sharedList[entry];
            }
            function IsValidEntryFolder(entry) {
                let Address=ConvertEntry(entry);
                return new Promise((resolve,reject)=>{
                    fs.stat(Address, (err, stats) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(stats.isDirectory());
                    })
                });
            }
            return {IsSharedEntry, ConvertEntry, IsValidEntryFolder};
        }
    }
    GetSkinFolder() {
        const SkinFolder=path.join(CURRENT_DIR,this.settings.skin)
        return SkinFolder;
    }
    GetSharedList() {
        //Return the shared folder list
        return this.settings.sharedList;
    }
    // Custom Model for Plugins
    RegisterCustomModel(name, model) {
        this.#customModels[name]=model;
    }
    GetCustomModel(name) {
        return this.#customModels[name];
    }

    // Configuration Management 
    GetHTTP2Config() {
        return {
            key: fs.readFileSync(this.settings.sslKey),
            cert: fs.readFileSync(this.settings.sslCert)
        };
    }
    GetFileUploadConfigs() {
        return {
            useTempFiles:this.settings.fileUploadUseTempFiles,
            tempFileDir:this.settings.fileUploadTempDir,
            limits:this.settings.fileUploadLimit
        };
    }

    // User Management
    GetUserHash(username) {
        return this.#users[username];
    }
    ExistUser(username) {
        return this.#users[username] != null;
    }
    AddUser(username, hashedPassword) {
        this.#users[username] = hashedPassword;
    }
    RemoveUser(username) {
        delete this.#users[username];
    }
}

module.exports = Model;