const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
module.exports = (model) => {
    //It is so working well. I'm so happy.
    const implement = {
        name: "Convert-any2mp4",
        callpath: "tomp4",
        run: async (req, res, args) => {
            return new Promise(async (resolve, reject) => {
                //args will be the fake path of the subtitle file. needs to be converted to real path.
                const fakePath = path.join(decodeURIComponent(req.path), decodeURIComponent(args)).replaceAll("\\", "/");
                const filePath = await model.ConvertPath(fakePath);
                if(filePath==null) {
                    return resolve(false);
                }
                const readStream = fs.createReadStream(filePath);
                const ffmpegCommand = ffmpeg(readStream, {logger: console})
                    .addOutputOptions('-movflags +frag_keyframe+separate_moof+omit_tfhd_offset+empty_moov')
                    .format('mp4')
                    .on('end', function() {
                        resolve(true);
                    })
                    .on('error', function(err) {
                        console.log(err);
                        resolve(false);
                    })
                    .pipe(res, {end:true});
            });
        },
        test: () => {
            return model!==undefined;
        }
    }
    return implement;
}