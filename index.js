console.log('Initializing - Loading Modules')

const hostname = 'localhost'
const port = 443
const portAlt = 80

const http2 = require('http2')
const http = require('http')
const { URLSearchParams } = require('url')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
const subsrt = require('./subsrt.js') // use modified subsrt library
const iconv = require('iconv-lite') // for detecting encoding types of given files
const chardet = require('chardet')
const os = require('os');
const LOG = require('./lib/log.js')
const q = new LOG()

const server = http2.createSecureServer({
  key: fs.readFileSync('cert/private.key.pem'),
  cert: fs.readFileSync('cert/domain.cert.pem')
}, (req, res) => {
  q.network(`Request From ${req.connection.remoteAddress}`)
})

server.listen(port, hostname, () => {
  q.done(`${hostname}:${port} - Server Started`)
})
http.createServer((req, res) => {
  q.network(`${hostname}:${portAlt} - Request From ${req.connection.remoteAddress}`)
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` })
  res.end()
}).listen(portAlt, hostname, () => {
  q.done(`${hostname}:${portAlt} - Alternative Server Started`)
})

q.done('Done - Loading Modules')

q.work('Initializing - miscellaneous')

var FOLDERS = {}
var Settings = {}

try {
  FOLDERS = fs.readFileSync('share.cfg', 'utf8')
  Settings = fs.readFileSync('settings.cfg', 'utf8')
} catch (e) {

}
if (Settings) {
  FOLDERS = Settings
  q.done('Setting Loaded')
}
q.done('Done - miscellaneous')

function ConvertAddress (Address) {
  q.dev(Address)
  if (Address) {
    const Path = Address.split('/')
    const Parent = FOLDERS[Path[1]]
    if (Parent) {
      if (fs.existsSync(Parent)) {
        var r = Parent // join rest folder
        const rlen = Path.length
        for (var rest = 2; rest < rlen; rest++) {
          if (Path[rest]) r = path.join(r, Path[rest])
        }
        return r
      } else {
        q.error(`NULL ADDRESS! ${Path}`)
        return null
        // throw new Error('parent not exists');
      }
    }
  }
  return null
}

function FormdataParse(body, headers) {
  const rawType=headers['content-type'].split(';')
  const type=rawType[0];
  const bound=rawType[1].split('=')[1];
  const bodybyline=body.split(/\r?\n/);
  const name=bodybyline[1].substring(bodybyline[1].indexOf(`filename="`)+`filename="`.length, bodybyline[1].lastIndexOf(`"`))
  const valid=(bodybyline[0].includes(bound))
  const actualbody=bodybyline.slice(3)
  let data="";
  for(const line of actualbody) {
    if(!line.includes(bound)) {
      data+=line+os.EOL;
    } else {
      break;
    }
  }
  const send = {
    type:type,
    bound:bound,
    name:name,
    valid:valid,
    body:data,
  }
  return send
}

server.on('session', (ses) => {
  q.network(`New Session - ${JSON.stringify(ses)}`, 1)
})

server.on('sessionError', (err, a) => {
  q.error('Session Error Occured!')
  q.error('----------------------')
  q.error(err)
  console.table(err)
  q.error('----------------------')
})

server.on('stream', (stream, headers) => {
  q.network(`${headers[':method']} ${decodeURI(headers[':path'])}`, 1)
  stream.on('error', (err) => {
    q.error('Error occured in stream!')
    q.error('----------------------')
    q.error(err)
    q.error('----------------------')
  })
  // const Authority = headers[':authority']
  let Path = decodeURI(headers[':path'])
  const ParamTemp = Path.split('?')

  var files = []
  var directories = []
  var file

  if (ParamTemp[1]) {
    const Param = new URLSearchParams(ParamTemp[1])
    if (Param.has('action')) {
      var data = Param.get('action')
      if (data === 'Resource') {
        q.work(`Parameter - Resource`)
        file = Param.get('file')
        if (file) {
          var address = path.join('./skin', file)
          SendFile(stream, headers, address)
        } else {
          stream.respond({ ':status': 404 })
          stream.end(`Error - No such file on resource!`)
          q.warn(`${file} - Null Resource Parameter Arguments`)
        }
      } else if (data === 'Convert-Subtitle') {
        file = Param.get('file')
        if (file) {
          // file = file.split(`/`);
          var realAddress = ConvertAddress(file)
          if (realAddress) {
            fs.stat(realAddress, (err, stats) => {
              if (!err) {
                if (stats.isDirectory()) {
                  stream.respond({ ':status': 500 })
                  stream.end(`Error - It was not a file but directory. wait what?`)
                  q.warn(`${file} - Error - Lol it was not a file. moron`)
                } else if (stats.isFile()) {
                  var tmp = fs.readFileSync(realAddress)
                  var sub
                  var encode2 = chardet.detect(tmp)
                  if (iconv.encodingExists(encode2)) {
                    sub = iconv.decode(tmp, encode2) // encode.encoding
                  } else {
                    stream.respond({ ':status': 501 })
                    stream.end(`Convert Error - Not supported encode type it was.`)
                    q.warn(`${file} - Convert Error - Not supported encode type it was.`)
                    return
                  }
                  var ConvertedSub
                  try {
                    ConvertedSub = subsrt.convert(sub, { format: 'vtt' })
                    const type = mime.lookup('vtt')
                    if (ConvertedSub) {
                      stream.respond({
                        ':status': 200,
                        'Content-type': type,
                        charset: 'utf-8'
                      })
                      stream.end(ConvertedSub)
                    } else {
                      stream.respond({ ':status': 500 })
                      stream.end(`Error - ${err} / Unexpected Error Occured`)
                      q.warn(`${file} - Convert Error ${err} / Unexpected Error Occured`)
                    }
                  } catch (err) {
                    stream.respond({ ':status': 500 })
                    stream.end(`Error - ${err} / Unexpected Error Occured`)
                    q.warn(`${file} - Convert Error ${err} / Unexpected Error Occured`)
                  }
                } else {
                  stream.respond({ ':status': 500 })
                  stream.end(`Error - It's all good but it was unexcepted file type what the hell is it?`)
                  q.warn(`${file} - was not valid and unexpected file type it was.`)
                }
              } else {
                stream.respond({ ':status': 404 })
                stream.end(`Error - It's shared but not real file`)
                q.warn(`${file} - was not valid and not reachable`)
              }
            })
          } else {
            stream.respond({ ':status': 404 })
            stream.end(`Error - It's not shared`)
            q.warn(`${file} - was forbidden`)
          }
        } else {
          stream.respond({ ':status': 404 })
          stream.end(`Error - No such file on resource! `)
          q.warn(`There was no parameter on converting files`)
        }
      } else if(data === "Upload") {
        uploadFolder = Param.get('folder')
        if (uploadFolder) {
          if(headers[':method']==="POST") {
            let r=ConvertAddress(uploadFolder)
            if(r) {
              let data=""
              stream.on("data", (chunk)=>{
                  if(chunk!=undefined) {
                    data+=chunk;
                  }
              });
              stream.on("end", () => {
                let dt=FormdataParse(data, headers)
                fs.writeFile(path.join(r, dt.name), dt.body, (err) => {
                  if (err) {
                    q.warn(`${path.join(r, dt.name)} - error while writing file`)
                  } else {
                    q.info(`${path.join(r, dt.name)} uploaded`)
                  }
                });
              })
            } else {
              stream.respond({ ':status': 404 })
              stream.end(`Error - No such file on resource!`)
              q.warn(`${file} - Not shared`)
            }
          } else {
            stream.respond({ ':status': 405 })
            stream.end(`Error - No such file on resource!`)
            q.warn(`${file} - Null Resource Parameter Arguments`)
          }
        } else {
          stream.respond({ ':status': 403 })
          stream.end(`Error - No such file on resource!`)
          q.warn(`${file} - Null Resource Parameter Arguments`)
        }
      } else {
        stream.respond({ ':status': 404 })
        stream.end(`Error - No such file on resource!`)
        // q.warn(`${Param} - Could not find parameter`);
      }
    }
  } else {
    var encoded = Path
    encoded = encoded.replace(`&#39;`, `'`)
    encoded = encoded.replace(`&#34;`, `"`)
    var Address = ConvertAddress(encoded)
    if (Address) {
      q.dev(`entering access - ${Address}`)
      fs.access(Address, fs.constants.F_OK, (err) => {
        q.work(`${Address} - ${err ? 'Does not exist' : 'Exists'}`)
        if (!err) {
          var ParentStat = fs.statSync(Address)
          if (ParentStat.isDirectory()) {
            stream.respond({ ':status': 200, 'Content-Type': 'text/html; charset=utf-8' })
            fs.readdir(Address, (err, __files) => {
              if (!err) {
                var skin = fs.readFileSync(`./skin/anta.html`, 'utf8')
                stream.write(skin)

                const fLen = __files.length
                for (var i = 0; i < fLen; i++) {
                  var InstanceAddress = path.join(Address, __files[i])
                  var fStats
                  try {
                    fStats = fs.statSync(InstanceAddress)
                    __files[i] = encodeURI(__files[i])
                    __files[i] = __files[i].replace(/'/g, `&#39;`)
                    __files[i] = __files[i].replace(/"/g, `&#34;`)
                    // __files[i] = __files[i].replace(/'/g, "&#39;");
                    // __files[i] = __files[i].replace(/"/g, "&#34;");
                    if (fStats.isDirectory()) {
                      directories.push({ name: __files[i], stat: fStats }) // stats.birthtime
                    } else {
                      files.push({ name: __files[i], stat: fStats }) // stats.birthtime , stats.ctime
                    }
                  } catch (err) {
                    q.warn(`Error while pushing directory - ${err}`)
                  }
                }
                Path = Path.replace(/'/g, `&#39;`)
                Path = Path.replace(/"/g, `&#34;`)
                Path = encodeURI(Path)

                var listof = {}
                listof.files = files
                listof.directories = directories
                listof.url = Path
                const send = JSON.stringify(listof)
                stream.write(`<div id='data'><div id='list' data-list='${send}'></div></div>`)
                q.done('Data Writed')
                stream.end()
              } else {
                stream.respond({ ':status': 500 })
                stream.end(`Error while reading directory : ${err}`)
                q.error('Directory Error Occured!')
                q.error('----------------------')
                q.error(err)
                q.error('----------------------')
              }
            })
          } else if (ParentStat.isFile()) {
            q.network(`Sending File... - ${Address}`, 2)
            /* let encodedPath = Address
            encodedPath = encodedPath.replace(`&#39;`, `'`)
            encodedPath = encodedPath.replace(`&#34;`, `"`) */
            SendFile(stream, headers, Address)
          } else {
            stream.respond({ ':status': 500 })
            stream.end(`Error while determing type : It's not valid!`)
            q.warn(`Cannot determine file type - ${Address}`)
            // not valid
          }
        } else {
          stream.respond({ ':status': 500 })
          stream.end(`Error while accessing file/folder : ${err}`)
          q.warn(`Cannot accessing file/folder - ${err}`)
        }
      })
    } else {
      if (Path === `/`) {
        var skin = fs.readFileSync(`./skin/anta.html`, 'utf8')
        stream.write(skin)

        var main = []
        for (var folder in FOLDERS) {
          try {
            var stats = fs.statSync(FOLDERS[folder])
            if (stats) {
              main.push({ name: folder, birth: stats.birthtime, ctime: stats.ctime })
            } else {
              main.push({ name: folder, birth: '', ctime: '' })
              q.error(`unable to stat shared folder - ${folder}`)
            }
          } catch (err) {
            q.error(`unable to stat shared folder in try level - ${folder}, ${err}`)
          }
        }
        var listof = {}
        listof.directories = main
        listof.url = ''
        const send = JSON.stringify(listof)
        // var resultBuffer = encoding.convert(go, 'ASCII', 'UTF-8');
        // set div
        stream.end(`<div id='data'><div id='list' data-list='${send}'></div></div>`)
      } else {
        stream.respond({ ':status': 500 })
        stream.end(`Error while accessing file/folder : it's not shared!`)
        q.warn(`${Address} - It was not shared`)
      }
    }
  }
})

server.on('error', (err) => {
  q.error('Error occured in server!')
  q.error('----------------------')
  q.error(err)
  console.table(err)
  q.error('----------------------')
})
q.info(`Server listening on port ${port}`)

function SendFile (stream, headers, address) {
  const ext = path.extname(address)
  const type = mime.lookup(ext)

  if (headers[':method'] !== 'GET') {
    stream.respond({ ':status': 405 })
    stream.end()
    return null
  }
  var hd = {}
  fs.stat(address, (err, stat) => {
    if (!err) {
      const rangeRequest = readRangeHeader(headers['range'], stat.size)
      hd['last-modified'] = stat.mtime.toUTCString()
      if (rangeRequest === null) {
        hd['Content-Type'] = type
        hd['Accept-Ranges'] = 'bytes'
        stream.respondWithFile(address, hd, {
          onError: function (err) {
            console.log(err)
          }
        })
      } else {
        const start = rangeRequest.Start
        const end = rangeRequest.End
        if (start >= stat.size || end >= stat.size) {
          // Indicate the acceptable range.
          hd['Content-Range'] = 'bytes */' + stat.size // File size.
          hd[':status'] = 416
          // Return the 416 'Requested Range Not Satisfiable'
          stream.respond(hd)
          stream.end()
        } else {
          hd['Content-Range'] = 'bytes ' + start + '-' + end + '/' + stat.size
          hd['Content-Type'] = type
          hd['Accept-Ranges'] = 'bytes'
          hd['Cache-Control'] = 'no-cache'
          hd[':status'] = 206
          stream.respondWithFile(address, hd, { offset: start, length: end })
        }
      }
    } else {
      onError(err)
    }
  })
  function onError (err) {
    if (err.code === 'ENOENT') {
      stream.respond({ ':status': 404 })
    } else {
      stream.respond({ ':status': 500 })
    }
    stream.end()
  }
}

function readRangeHeader (range, totalLength) {
  /*
   * Example of the method 'split' with regular expression.
   *
   * Input: bytes=100-200
   * Output: [null, 100, 200, null]
   *
   * Input: bytes=-200
   * Output: [null, null, 200, null]
   */

  if (range == null || range.length === 0) return null

  var array = range.split(/bytes=([0-9]*)-([0-9]*)/)
  var start = parseInt(array[1])
  var end = parseInt(array[2])
  var result = {
    Start: isNaN(start) ? 0 : start,
    End: isNaN(end) ? (totalLength - 1) : end
  }

  if (!isNaN(start) && isNaN(end)) {
    result.Start = start
    result.End = totalLength - 1
  }

  if (isNaN(start) && !isNaN(end)) {
    result.Start = totalLength - end
    result.End = totalLength - 1
  }

  return result
}

/*
command
*/

var stdin = process.openStdin()
stdin.addListener('data', (d) => { // input
  var get = d.toString().trim().split(' ')
  var par, folder
  if (get[0] === 'add') {
    par = d.toString().trim().split(`"`)
    if (par[1] == null || par[3] == null) {
      q.error('It\'s not vaild value.')
    } else if (FOLDERS[par[3]]) {
      q.info(`${par[1]} Was already listed  ${par[3]}`)
    } else {
      FOLDERS[par[3]] = par[1] // fake : real
      q.done(`${par[1]} Was shared to ${par[3]}`)
    }
  }
  if (get[0] === 'del') {
    par = d.toString().trim().split(`"`)
    for (folder in FOLDERS) {
      q.info(folder + folder.keys)
    }

    if (FOLDERS[par[1]]) {
      delete FOLDERS[par[1]] // undefined? delete?
      q.warn(`${par[1]} was deleted`)
    } else {
      q.error(`${par[1]} was not exist`)
    }
  }
  if (get[0] === 'get') {
    for (folder in FOLDERS) {
      q.info(folder + folder.keys)
    }
  }
  if (get[0] === 'sav') {
    var stream = fs.createWriteStream('server.cfg')
    stream.once('open', function (fd) {
      stream.write(JSON.stringify(FOLDERS))
      stream.end()
    })
    q.info('Saved')
  }
  if (get[0] === 'lod') {

  }
})
