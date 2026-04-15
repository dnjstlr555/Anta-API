const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

module.exports = (model) => {
    const implement = {
        name: "Convert-any2hls",
        callpath: "tohls",
        init: () => {
            const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
            const ffprobePath = require('@ffprobe-installer/ffprobe').path;
            ffmpeg.setFfmpegPath(ffmpegPath);
            ffmpeg.setFfprobePath(ffprobePath);
        },
        run: async (req, res, args) => {
            return new Promise(async (resolve, reject) => {
                const originalUrl = decodeURIComponent(req.path);
                const urlParts = originalUrl.split('/').filter(part => part.length > 0);
                const fkjscript = urlParts.slice(0, -1).join('/') + decodeURIComponent(req.baseUrl);
                const fakePath = fkjscript + '/' + args;
                const filePath = await model.ConvertPath(fakePath);
                
                if (filePath == null) {
                    res.status(404).end();
                    return resolve(false);
                }

                const targetDuration = 10;
                const segmentIndex = req.query.segment;
                const preview = req.query.preview;

                if (segmentIndex === undefined && preview === undefined) {
                    ffmpeg.ffprobe(filePath, (err, metadata) => {
                        if (err || !metadata || !metadata.format || !metadata.format.duration) {
                            console.error("ffprobe error:", err);
                            return resolve(false);
                        }

                        const duration = metadata.format.duration;
                        let m3u8 = "#EXTM3U\n";
                        m3u8 += "#EXT-X-VERSION:3\n";
                        m3u8 += `#EXT-X-TARGETDURATION:${targetDuration}\n`;
                        m3u8 += "#EXT-X-MEDIA-SEQUENCE:0\n";
                        m3u8 += "#EXT-X-PLAYLIST-TYPE:VOD\n";

                        let remaining = duration;
                        let i = 0;

                        while (remaining > 0) {
                            let chunkDuration = Math.min(targetDuration, remaining);
                            m3u8 += `#EXTINF:${chunkDuration.toFixed(6)},\n`;
                            m3u8 += `?tohls=${args}&segment=${i}\n`; 
                            remaining -= targetDuration;
                            i++;
                        }
                        m3u8 += "#EXT-X-ENDLIST\n";

                        res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl' });
                        res.end(m3u8);
                        resolve(true);
                    });
                } 
                else if (segmentIndex !== undefined) {
                    const index = parseInt(segmentIndex);
                    const startTime = index * targetDuration;
                    const endTime = startTime + targetDuration;
                    res.writeHead(200, {
                        'Content-Type': 'video/MP2T',
                        'Connection': 'keep-alive'
                    });

                    ffmpeg(filePath)
                        .seekInput(startTime)
                        .inputOptions([
                            '-copyts'
                        ])
                        .outputOptions([
                            `-to ${endTime}`,
                            '-preset ultrafast',
                            '-vcodec libx264',
                            '-acodec aac',
                            '-avoid_negative_ts disabled',
                            '-f mpegts',
                            '-muxdelay 0'
                        ])
                        .on('end', () => resolve(true))
                        .on('error', (err) => {
                            if (!res.headersSent) res.end();
                            resolve(true);
                        })
                        .pipe(res, { end: true });
                } else if (preview !== undefined) {
                    try {
                        const hash = crypto.createHash('md5').update(filePath).digest('hex');
                        console.log(filePath, hash);
                        const outputDir = path.join(__dirname, 'preview_cache', hash); 
                        const vttPath = path.join(outputDir, 'thumbnails.vtt');

                        if (preview !== "vtt") {
                            const thumbnailPath = path.join(outputDir, preview.replace('vtt', 'jpg'));
                            console.log("Serving cached thumbnail: ", thumbnailPath);

                            if (fs.existsSync(thumbnailPath)) {
                                console.log("Thumbnail found, serving: ", thumbnailPath);    
                                res.set('Content-Type', 'image/jpeg');
                                res.send(fs.readFileSync(thumbnailPath));
                                return resolve(true);
                            }
                        }

                        if (fs.existsSync(vttPath)) {
                            res.set('Content-Type', 'text/vtt; charset=utf-8');
                            res.send(fs.readFileSync(vttPath, 'utf8'));
                            resolve(true);
                        }
                        if (!fs.existsSync(outputDir)) {
                            fs.mkdirSync(outputDir, { recursive: true });
                        }
                        const duration = await new Promise((resolve, reject) => {
                            ffmpeg.ffprobe(filePath, (err, metadata) => {
                                if (err) reject(err);
                                else resolve(metadata.format.duration);
                            });
                        });

                        const interval = 10;
                        const cols = 5;
                        const rows = 5;
                        const thumbWidth = 160; 
                        const thumbHeight = 90;
                        await new Promise((resolve, reject) => {
                            ffmpeg(filePath)
                                .outputOptions([
                                    `-vf fps=1/${interval},scale=${thumbWidth}:${thumbHeight},tile=${cols}x${rows}`,
                                    '-frames:v ' + Math.ceil(duration / interval),
                                    '-q:v 2'
                                ])
                                .output(path.join(outputDir, 'sprite_%03d.jpg'))
                                .on('end', resolve)
                                .on('error', reject)
                                .run();
                        });

                        let vttContent = "WEBVTT\n\n";
                        const totalFrames = Math.ceil(duration / interval);
                        const framesPerSprite = cols * rows;

                        for (let i = 0; i < totalFrames; i++) {
                            const startTime = formatTime(i * interval);
                            const endTime = formatTime((i + 1) * interval);
                            
                            const spriteIndex = Math.floor(i / framesPerSprite) + 1;
                            const paddedIndex = String(spriteIndex).padStart(3, '0');
                            
                            const indexInSprite = i % framesPerSprite;
                            const x = (indexInSprite % cols) * thumbWidth;
                            const y = Math.floor(indexInSprite / cols) * thumbHeight;

                            vttContent += `${startTime} --> ${endTime}\n`;
                            vttContent += `${fkjscript}?tohls=${args}&preview=sprite_${paddedIndex}.jpg#xywh=${x},${y},${thumbWidth},${thumbHeight}\n\n`;
                        }
                        fs.writeFileSync(vttPath, vttContent, 'utf8');
                        
                        res.set('Content-Type', 'text/vtt; charset=utf-8');
                        res.send(vttContent);
                        resolve(true);
                    } catch (err) {
                        console.error("Preview generation error: ", err);
                        if (!res.headersSent) {
                            res.status(500).send("Preview generation failed");
                        }
                        resolve(true);
                    }

                    function formatTime(seconds) {
                        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
                        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
                        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
                        return `${h}:${m}:${s}.000`;
                    }
                }
            });
            
        },
        test: () => {
            return model !== undefined;
        }
    }
    return implement;
}