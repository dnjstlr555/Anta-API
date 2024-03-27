const fs = require('fs');
const os = require('os');
const path = require('path');
const { generateKeyPair } = require('node:crypto');
const essentialConfig = require('./essentialConfig');
const { ParseConfig, WriteConfig, ValidateShared, ValidateGeneral } = require('./manageConfig');

function ConstructSettings(sharedPath = null, configPath = null) {
    /*
    Construct the settings object
    1.Check valid paths 
    2.Load configs from raw object format
    3.Validate configs and edit if necessary ->  TODO : integrate plugin configs
    4.Merge configs into one object
    5.Export the necessary configs if paths were invalid
    returns the settings object
    */
    let settings = {};
    // Check the "Path" is valid
    let isSharedValid = sharedPath !== null && fs.existsSync(sharedPath);
    let isConfigValid = configPath !== null && fs.existsSync(configPath);
    // Validate configs and edit if necessary
    // If path is invalid, use default one instead
    let shared = isSharedValid ? ValidateShared(ParseConfig(sharedPath)) : {};
    let general = isConfigValid ? ValidateGeneral(ParseConfig(configPath)) : essentialConfig;
    // TODO : integrate plugin configs

    // Export the necessary configs if paths were invalid
    let defaultQuoteOnShared = '';
    if (!isSharedValid) {
        defaultQuoteOnShared = '#The left side of \'=\' is the name of the folder you will share, the right side is the path to the folder on your computer' + os.EOL + '#You can add as many folders as you want, just make sure to follow the same format';
    }
    WriteConfig(sharedPath, shared, defaultQuoteOnShared);
    WriteConfig(configPath, general);
    return {shared, general};
}

function ConstructUsers() {
    // TODO : Placeholder
    return {
    };
}
async function ConstructLoginCerts(publicKeyPath = null, privateKeyPath = null) {
    const isCertPathValid = (publicKeyPath !== null && privateKeyPath !== null) && (fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath));
    if (!isCertPathValid) {
        if (publicKeyPath == null || privateKeyPath == null) {
            throw new Error("Invalid public key or private key path");
        }
        console.log("Generating a new RSA key pair for login token signing");
        const { publicKey, privateKey } = await generatePairs();
        //if the folder is not exist, create it
        if (!fs.existsSync(path.dirname(publicKeyPath))) {
            fs.mkdirSync(path.dirname(publicKeyPath), { recursive: true });
        }
        if (!fs.existsSync(path.dirname(privateKeyPath))) {
            fs.mkdirSync(path.dirname(privateKeyPath), { recursive: true });
        }
        fs.writeFileSync(publicKeyPath, publicKey);
        fs.writeFileSync(privateKeyPath, privateKey);
    }
    return {
        publicKey: fs.readFileSync(publicKeyPath),
        privateKey: fs.readFileSync(privateKeyPath)
    }
    function generatePairs() {
        return new Promise((resolve, reject) => {
            generateKeyPair('rsa', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem',
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                },
            }, (err, publicKey, privateKey) => {
                if (err) {
                    reject(err);
                }
                resolve({ publicKey, privateKey });
            });
        });
    }
}
module.exports = {
    ConstructSettings,
    ConstructUsers,
    ConstructLoginCerts
};

