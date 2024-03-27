const fs = require('fs');
const path = require('path');
const CURRENT_DIR = __dirname.split(/\\|\//).slice(0, -1).join("/");
const constructs = require('./constructModel');
const manageConfig = require('./manageConfig');

class Model {
    #customModels;
    #users;
    #loginCerts;
    #initSharedPath;
    #initConfigPath;
    #shared;
    #general;
    constructor(sharedPath = "./shared.cfg", configPath = "./general.cfg") {
        this.#initSharedPath = sharedPath;
        this.#initConfigPath = configPath;
        const { shared, general } = constructs.ConstructSettings(sharedPath, configPath);
        this.#shared = shared;
        this.#general = general;
        this.#customModels = {}; //Custom models for plugins that can save any data during the server is running
        this.#users = constructs.ConstructUsers();
        this.#loginCerts = constructs.ConstructLoginCerts(this.settings.jwtRSAPublicKeyPath, this.settings.jwtRSAPrivateKeyPath);
    }
    get settings() {
        return Object.assign({}, this.#general, { sharedList: this.#shared });
    }
    async ConvertPath(fakePath) {
        /*
        example : path = /mv/koenokatachi.smi or mv/koenokatachi.smi 
        returns : /home/user/movie/koenokatachi.smi (combined path of sharedList and path)
        does not check if the file exists or not.
        */
        const { IsSharedEntry, ConvertEntry, IsValidEntryFolder } = Helper(this.settings);
        if (fakePath == null) return null;
        if (fakePath[0] == '/') fakePath = fakePath.slice(1); // remove first '/'
        const pathSplited = fakePath.split('/');
        if (!IsSharedEntry(pathSplited[0])) return null; // if there is no shared entry or the entry is invalid, return null
        const isValidEntry = await IsValidEntryFolder(pathSplited[0]);
        if (!isValidEntry) return null;
        return path.join(ConvertEntry(pathSplited[0]), ...pathSplited.slice(1));

        function Helper(settings) {
            function IsSharedEntry(entry) {
                return Object.keys(settings.sharedList).includes(entry);
            }
            function ConvertEntry(entry) {
                return settings.sharedList[entry];
            }
            function IsValidEntryFolder(entry) {
                let Address = ConvertEntry(entry);
                return new Promise((resolve, reject) => {
                    fs.stat(Address, (err, stats) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(stats.isDirectory());
                    })
                });
            }
            return { IsSharedEntry, ConvertEntry, IsValidEntryFolder };
        }
    }
    WriteSharedConfig() {
        this.#shared=manageConfig.ValidateShared(this.#shared);
        manageConfig.WriteConfig(this.#initSharedPath, this.#shared);
    }
    AddSharedFolder(name, path) {
        this.settings.sharedList[name] = path;
        this.WriteSharedConfig();
    }
    RemoveSharedFolder(name) {
        delete this.settings.sharedList[name];
        this.WriteSharedConfig();
    }
    get skinPath() {
        const SkinFolder = path.join(CURRENT_DIR, this.settings.skin)
        return SkinFolder;
    }
    get sharedList() {
        //Return the shared folder list
        return this.#shared;
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
            useTempFiles: this.settings.fileUploadUseTempFiles,
            tempFileDir: this.settings.fileUploadTempDir,
            limits: this.settings.fileUploadLimit
        };
    }

    // Custom Model for Plugins
    RegisterCustomModel(name, model) {
        this.#customModels[name] = model;
    }
    GetCustomModel(name) {
        return this.#customModels[name];
    }

    // User Management
    GetCertKeys() {
        return this.#loginCerts;
    }
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