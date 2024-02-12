const subsrt = require('subsrt');
const fs = require('fs');
module.exports = (model) => {
    const implement = {
        name: "Convert-Subtitle",
        callpath: "convsub",
        run: async (req, res, args) => {
            //args will be the fake path of the subtitle file. needs to be converted to real path.
            const filePath = await model.ConvertPath(decodeURIComponent(args));
            if(filePath==null) {
                return false; //If the plugin's result is false, the route will flag the error
            }
            const file = await ReadFile(filePath);
            const result = subsrt.convert(file, { format: 'vtt' });
            res.set('Content-Type', 'text/vtt');
            res.send(result);
            return true;

            //Helper functions
            function ReadFile(filePath) {
                return new Promise((resolve, reject) => {
                    fs.readFile(filePath, (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(data.toString());
                    }); 
                });
            }
        },
        test: () => {
            return model!==undefined;
        }
    }
    return implement;
}