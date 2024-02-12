# Anta API
Anta is a multi-functional self hosted media streaming service. [Check this demo video](https://www.youtube.com/watch?v=XggPtIFNnFw) / [#2](https://www.youtube.com/watch?v=F4RvdVo_5BM)
## Feature 
- Supports video, music streaming<br>
- Video streaming with automatic subtitle detection within same folder<br>
- Subtitle converter for any subtitle to vtt(to provide subtitle on the streaming video) within same folder<br>
- Swipable image viewer<br>
- Responsive UI design<br>
- Works on http2 protocol
- Groupwatch feature (sync a video between two users, experimental)

## Installation 
```
npm install
```
will download necessary packages.
```
cd src
node app.js
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
port=443 #port number for main server.
portRedir=80 #port for http->https redirection server.
ssl=true #if true, use https(http2).  
sslKey=./ssl.key #specify key and cert for https server.
sslCert=./ssl.crt 
skin=./skin #skin folder that contains frontend data.
startWizard=true #currently do nothing.
```
Now, restart server again and enter http://localhost.

## TODO
[Visit Here For Future Roadmaps](https://oh16.notion.site/ecd578a7359f4fc493272098593cfff7?v=d79ef83ea44e405dbdfa931b7127c5d9&pvs=4)

