const fs = require('fs');
const os = require('os');
const path = require('path');
const essentialConfig = require('./essentialConfig');

// Helper functions
// Load configs from raw object format
function ParseConfig(filePath = null) {
    /*
    Parse config entries from the file path

    file format:
    [Visible Name]=[Real Path] (newline)
    
    returns an object in the format:
    {[Visible Name]=[Real Path]}
    */
    if (filePath == null || fs.existsSync(filePath) == false) return null;
    let folders = {};
    let file = fs.readFileSync(filePath, 'utf8');
    let lines = file.split(/\r?\n/);
    for (let i of lines) {
        if (i.length <= 0 || !i.includes("=") || i[0] == "#") continue;
        let split = i.split("=");
        if (split.length != 2) continue;
        folders[split[0]] = split[1];
    }
    return folders;
}
function WriteConfig(filePath, config, header = "") {
    //Config is an object in the format {[Entry name]=[Value]}
    let file = "";
    file += header + os.EOL;
    for (let i of Object.keys(config)) {
        file += i + "=" + config[i] + os.EOL;
    }
    //if the folder is not exist, create it
    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    fs.writeFileSync(filePath, file);
}
function ValidateShared(cfg) {
    const reservedWords = ["login", "signup", "logout", "changepw"];
    const chars = ["\\", "/", "=", "*", "?", "\"", "<", ">", "|"];
    let check = false;
    for (let i in cfg) {
        check = false;
        for (let j of chars) {
            if (i.includes(j)) check = true;
            break;
        }
        if (!fs.existsSync(cfg[i]) || !fs.statSync(cfg[i]).isDirectory() || reservedWords.includes(i) || i == "") check = true;
        if (check) delete cfg[i];
    }
    return cfg;
}
function ValidateGeneral(cfg) {
    //check entries from essentialConfig exits and valid, if not use default one instead
    let essential = essentialConfig;
    for (let i of Object.keys(essential)) {
        if (cfg[i] == null) {
            cfg[i] = essential[i];
        }
    }
    //check all entries and cast to correct type according to the essentialConfig
    //if the entry is not in the essentialConfig, it will be ignored
    for (let i of Object.keys(cfg)) {
        if (essential[i] != null) {
            cfg[i] = autoCast(cfg[i], typeof essential[i]);
        }
    }
    function autoCast(value, referType) {
        if (referType == null) return value;
        if (referType == "number") return Number(value);
        if (referType == "boolean") return value == "true";
        return value;
    }
    return cfg;
}

module.exports = { ParseConfig, WriteConfig, ValidateShared, ValidateGeneral };