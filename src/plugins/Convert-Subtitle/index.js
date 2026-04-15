const subsrt = require('subsrt');
const fs = require('fs');
const path = require('path');
const jschardet = require('jschardet');
const iconv = require('iconv-lite');

module.exports = (model) => {
    const implement = {
        name: "Convert-Subtitle",
        callpath: "convsub",
        run: async (req, res, args) => {
            try {
                //args will be the fake path of the subtitle file. needs to be converted to real path.
                const originalUrl = decodeURIComponent(req.path);
                const urlParts = originalUrl.split('/').filter(part => part.length > 0);
                const fakePath = urlParts.slice(0, -1).join('/') + req.baseUrl + '/' + args;
                const filePath = await model.ConvertPath(fakePath);
                
                if (filePath == null) {
                    return false;
                }
                
                const fileContent = await ReadFile(filePath);
                const result = subsrt.convert(fileContent, { format: 'vtt' });

                res.set('Content-Type', 'text/vtt; charset=utf-8');
                res.send(result);
                return true;
            } catch (err) {
                console.error("Subtitle conversion error: ", err);
                if (!res.headersSent) {
                    res.status(500).send("Subtitle load failed");
                }
                return true;
            }

            //Helper functions
            function ReadFile(filePath) {
                return new Promise((resolve, reject) => {
                    fs.readFile(filePath, (err, buffer) => {
                        if (err) {
                            return reject(err);
                        }
                        const detected = jschardet.detect(buffer);
                        let encoding = detected.encoding ? detected.encoding.toLowerCase() : 'utf-8';
                        if (encoding === 'euc-kr' || encoding === 'ks_c_5601-1987') {
                            encoding = 'cp949';
                        }
                        if (detected.confidence < 0.5) {
                            console.log(`Low confidence in encoding detection (${detected.confidence}), defaulting to prefered language. ${detected.encoding}`);
                            encoding = 'cp949';
                        }
                        let decodedString;
                        if (iconv.encodingExists(encoding)) {
                            decodedString = iconv.decode(buffer, encoding);
                        } else {
                            decodedString = iconv.decode(buffer, 'utf-8');
                        }
                        resolve(decodedString);
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