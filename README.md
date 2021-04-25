# Anta API
Anta API is lightweight network storage service. [Demo Here](https://kickback.party)
## Feature 
- Supports video, music streaming<br>
- Video streaming with automatic subtitle detection within same folder<br>
- Subtitle converter for smi to vtt(to provide subtitle on the streaming video) - planning to support more various formats<br>
- Swipable image viewer<br>
- Responsive UI design<br>
- Supports fast http2<br>

## Installation 
Firstly, Install 'mime-types', 'iconv-lite', 'chardet' via 'npm install'. <br>
Specify hostname and ports at index.js after.
```python
const hostname = 'localhost' 
const port = 443 # Port number for http2/https
const portAlt = 80 # Port for http(use for redirection to http2/https)
```
Second, You need to provide key and cert files at './cert/private.key.pem' and './cert/domain.cert.pem'. You can specify the location at top line of index.js.<br>
You cannot run the sever unless you put them all in the location.<br>
```python
const keyLocation = 'cert/private.key.pem'
const certLocation = 'cert/domain.cert.pem'
```
For creating local key and cert for testing purpose, [Check here](https://gist.github.com/cecilemuller/9492b848eb8fe46d462abeb26656c4f8)<br>
Or you could use index-legacy.js. It is based on http, but no longer maintained. Recommending for use local only.<br><br>
Finally, excute index.js with node.
```
node index.js
```
If you are on linux or macOS, sudo is required.
```
sudo node index.js
```

## Usage
You can type various commands after the server has opened. 
```
add "Real Address" "Name"
ex) add "/home/pi/somefolder" "MyFolder"
```
add "Real Address" to a shared folder list. "Name" will be shown to the user.
```
del "Name"
ex) del "MyFolder"
```
delete "Name" named folder from shared folder list.
```
get
```
show a list of shared file list.


## TODO
- Upload feature
- Support downloading bigger files (currently about ~100GB per files)
- Save and load feature for shared folder lists
- Managing via configuration file
- More command
- GUI support
