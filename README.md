# Anta API
Anta is a multi-functional self hosted media streaming service. [Check this demo video](https://www.youtube.com/watch?v=XggPtIFNnFw) / [#2](https://www.youtube.com/watch?v=F4RvdVo_5BM)
## Feature 
- Can provide files and folders from a local machine in the web interface
- Also using the power of Node.js and modern web browser, can do several useful things

### Media
- Supports video, music streaming<br>
- Video streaming with automatic subtitle provider within the same folder<br>
- Use any types of subtitles (smi, srt, vtt...) to watch videos in the browser<br>
- Can stream many types of videos and codecs in the browser(avi, mkv, flv... using ffmpeg) not only mp4<br>
- Groupwatch feature (sync a video between a host and users, WIP) <br>

### Web features
- Responsive UI design<br>
- Swipable image viewer<br>
- File upload and other operations (rename, remove..) (WIP) <br>

### Specification
- Works on http2 protocol<br>
- Authentication (WIP) <br>
- GUI control of the running server (WIP) <br>


## Installation 
```
npm install
```
will download necessary packages.
```
npm run start ./configs/shared.cfg ./configs/general.cfg
```
Finally, this command will start the server and create new configuration files.<br>
at **shared.cfg** you can specify folders to share.
```
#shared.cfg
example=/usr/path/to/somewhere
exmaple2=C:\users\kim\Downloads
```
at **general.cfg** you can adjust various settings. 
```
port=80 #port number for main server when use http server.
portSSL=443 #for main server when use https server.
portRedir=80 #port for http->https redirection server.
ssl=false #if true, use https(http2).  
sslKey=./ssl.key #specify key and cert for https server.
sslCert=./ssl.crt 
jwtRSAPublicKeyPath=./cert/jwtRS256.key.pub #specify key and cert for JWT token authentication. (Generate ones if not exist)
jwtRSAPrivateKeyPath=./cert/jwtRS256.key
skin=./skin #skin folder that contains frontend data.
startWizard=true #currently do nothing.
fileUploadUseTempFiles=true #Write files to the drive instead of the memory when user tries to upload files
fileUploadTempDir=./temp 
fileUploadLimit=52428800 #Upload limits in bytes
```
Now, restart server again and enter http://localhost.

## TODO
[Visit Here For Future Roadmaps](https://oh16.notion.site/ecd578a7359f4fc493272098593cfff7?v=d79ef83ea44e405dbdfa931b7127c5d9&pvs=4)

