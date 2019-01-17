console.log('Initializing - Loading Modules');

const http = require('http');
const http2 = require('http2');
const { url, URLSearchParams } = require('url');
const fs = require('fs');
const path = require('path');
const port = process.argv[2] || 9000;
const maxfilesize = 1073741000; //1GigaBytes-1000
const mime = require('mime-types'); //npm install mime-types
const subsrt = require('./subsrt.js');
const iconv = require('iconv-lite');
var auth = require('http-auth');
//const detectCharacterEncoding = require('detect-character-encoding');
var chardet = require('chardet');
class log {
	constructor() {
		this.color = {
			Reset: "\x1b[0m",
			Bright: "\x1b[1m",
			Dim: "\x1b[2m",
			Underscore: "\x1b[4m",
			Blink: "\x1b[5m",
			Reverse: "\x1b[7m",
			Hidden: "\x1b[8m",

			FgBlack: "\x1b[30m",
			FgRed: "\x1b[31m",
			FgGreen: "\x1b[32m",
			FgYellow: "\x1b[33m",
			FgBlue: "\x1b[34m",
			FgMagenta: "\x1b[35m",
			FgCyan: "\x1b[36m",
			FgWhite: "\x1b[37m",

			BgBlack: "\x1b[40m",
			BgRed: "\x1b[41m",
			BgGreen: "\x1b[42m",
			BgYellow: "\x1b[43m",
			BgBlue: "\x1b[44m",
			BgMagenta: "\x1b[45m",
			BgCyan: "\x1b[46m",
			BgWhite: "\x1b[47m",
		};
  }
	dev(text) {
		console.log(`${this.color.BgWhite}${this.color.Bright}~ DEV ${text}${this.color.Reset}`);
	}
	error(text) {
		console.log(`${this.color.BgRed}${this.color.Bright}Ⅹ ERROR ${text}${this.color.Reset}`);
	}
	
	warn(text) {
		console.log(`${this.color.FgYellow}${this.color.Bright}※ WARN ${text}${this.color.Reset}`);
	}
	
	info(text) {
		console.log(`${this.color.Bright}${this.color.BgCyan}ⅰ info${this.color.Reset} ${text}`);
	}
	work(text) {
		console.log(`${this.color.Bright}${this.color.FgYellow}♪ Working${this.color.Reset} ${text}`);
	}
	done(text) {
		console.log(`${this.color.Bright}${this.color.FgCyan}√ done${this.color.Reset} ${text}`);
	}
	
	network(text, symbol) {
		var emoji = "…";
		if(symbol)
		{
			switch(typeof symbol)
			{
				case "string":
					emoji = symbol;
					break;
				case "number":
					switch(symbol)
					{
						case 1:
							emoji = "→"; //inbound
							break;
						case 2:
							emoji = "←"; //outbound
							break;
					}
					break;
				default:
					emoji = "…";
			}
		}
		console.log(`${this.color.Bright}${this.color.BgBlack}${emoji}${this.color.Reset}${this.color.BgBlack}${this.color.Reverse} Network${this.color.Reset} ${text}`);
	}
}

let q = new log();

var basic = auth.basic({
    realm: "Simon Area.",
    file: __dirname + "/pw.htpasswd" // gevorg:gpass, Sarah:testpass ...
});
const server = http2.createSecureServer({
  key: fs.readFileSync('self.key'),
  cert: fs.readFileSync('self.crt')
},onRequest);
function onRequest(req, res) {
	q.network(`Request From ${req.connection.remoteAddress}`);
}


q.done('Done - Loading Modules');

/*
	ANTA_API 
*/

/*
shared_folder : Shared Folder

*/

q.work('Initializing - miscellaneous');

var Shared_Folder = {};
var Settings = {};

try
{ 
	Shared_Folder = fs.readFileSync('share.cfg','utf8');
	Settings = fs.readFileSync('settings.cfg','utf8');
}
catch(e)
{
	
}
if(Settings)
{
	Shared_Folder = Settings;
	q.done('Setting Loaded');
}
q.done('Done - miscellaneous');

function address_toReal(Address)
{
	q.dev(Address);
	if(Address)
	{
		let Path = Address.split('/');
		let Parent = Shared_Folder[Path[1]];
		if(Parent)
		{
			if(fs.existsSync(Parent))
			{
				var Real_Address = Parent; //join rest folder
				let Real_Address_length = Path.length;
				for(var rest=2; rest<Real_Address_length; rest++) 
				{
					if(Path[rest]) Real_Address = path.join(Real_Address, Path[rest]);
				}
				return Real_Address;
			}
			else
			{
				q.error(`NULL ADDRESS! ${Path}`);
				return null;
				//throw new Error('parent not exists');
			}
		}
	}
	return null;
}

server.on('session', (ses) =>
{
	q.network(`New Session - ${JSON.stringify(ses)}`,1);
});

server.on('sessionError', (err, a) =>
{
	q.error('Session Error Occured!');
	q.error('----------------------');
	q.error(err);
	console.table(err);
	q.error('----------------------');
});

server.on('stream', (stream, headers) =>
{
	q.network(`${headers[':method']} ${decodeURI(headers[':path'])}`,1);
	stream.on('error', (err) => {
		q.error('Error occured in stream!');
		q.error('----------------------');
		q.error(err);
		q.error('----------------------');
	});
	let Authority = headers[':authority'];
	let Path = decodeURI(headers[':path']);
	let ParamTemp = Path.split('?');
	
	var files = [];
	var directories = [];
	
	if(ParamTemp[1])
	{
		let Param = new URLSearchParams(ParamTemp[1]);
		if(Param.has('action'))
		{
			var data = Param.get('action');
			if(data == "Resource")
			{
				q.work(`Parameter - Resource`);
				var file = Param.get('file');
				if(file)
				{
					var address = path.join('./skin', file);
					file_send(stream, headers, address);
				}
				else
				{
					stream.respond({ ':status': 404});
					stream.end(`Error - No such file on resource!`);
					q.warn(`${file} - Null Resource Parameter Arguments`);
				}
			}
			else if(data == "Convert-Subtitle")
			{
				console.log("=======[We are In Convert]======");
				var file = Param.get('file');
				if(file)
				{
					//file = file.split(`/`);
					var real_address = address_toReal(file);
					if(real_address)
					{
						fs.stat(real_address, (err, stats) => {
							if(!err) {
								if(stats.isDirectory())
								{
									stream.respond({ ':status': 500});
									stream.end(`Error - It was not a file but directory. wait what?`);
									q.warn(`${file} - Error - Lol it was not a file. moron`);
								}
								else if(stats.isFile())
								{
									var tmp = fs.readFileSync(real_address);
									var sub;
									//var encode = jschardet.detect(sub);
									//console.log(encode);
									var encode2 =  chardet.detect(tmp);
									console.log("sec " + encode2);
									if(iconv.encodingExists(encode2))
									{
										sub = iconv.decode(tmp, encode2); //encode.encoding
									}
									else
									{
										stream.respond({ ':status': 501});
										stream.end(`Convert Error - Not supported encode type it was.`);
										q.warn(`${file} - Convert Error - Not supported encode type it was.`);
										return;
										/*
										var iconv = new Iconv(encode2, 'utf-8//TRANSLIT//IGNORE');
										try{
										sub = iconv.convert(tmp);
										}
										catch(e){
											response_end(response,`convert error: ${e}`, 500);
										}
										*/
									}
									var sub_converted;
									try {
										sub_converted = subsrt.convert(sub, { format: 'vtt' });
										let type = mime.lookup('vtt');
										if(sub_converted)
										{
											stream.respond({
												':status': 200,
												'Content-type': (type) ? type : null,
												'charset':'utf-8',
											});
											stream.end(sub_converted);
										}
										else
										{
											stream.respond({ ':status': 500});
											stream.end(`Error - ${err} / Unexpected Error Occured`);
											q.warn(`${file} - Convert Error ${err} / Unexpected Error Occured`);
										}
									}
									catch(err) {
										stream.respond({ ':status': 500});
										stream.end(`Error - ${err} / Unexpected Error Occured`);
										q.warn(`${file} - Convert Error ${err} / Unexpected Error Occured`);
									}
								}
								else
								{
									stream.respond({ ':status': 500});
									stream.end(`Error - It's all good but it was unexcepted file type what the hell is it?`);
									q.warn(`${file} - was not valid and unexpected file type it was.`);
								}
							}
							else
							{
								stream.respond({ ':status': 404});
								stream.end(`Error - It's shared but not real file`);
								q.warn(`${file} - was not valid and not reachable`);
							}
						});
					}
					else
					{
						stream.respond({ ':status': 404});
						stream.end(`Error - It's not shared`);
						q.warn(`${file} - was forbidden`);
					}
				}
				else
				{
					stream.respond({ ':status': 404});
					stream.end(`Error - No such file on resource! `);
					q.warn(`There was no parameter on converting files`);
				}
			}
			else
			{
				stream.respond({ ':status': 404});
				stream.end(`Error - No such file on resource!`);
				//q.warn(`${Param} - Could not find parameter`);
			}
		}
	}
	else
	{
		var encoded = Path;
		encoded = encoded.replace(`&#39;`, `'`);
		encoded = encoded.replace(`&#34;`, `"`);
		var Address = address_toReal(encoded);
		if(Address)
		{
			q.dev(`entering access - ${Address}`);
			fs.access(Address, fs.constants.F_OK, (err) => {
				q.work(`${Address} - ${err ? 'Does not exist' : 'Exists'}`);
				if(!err)
				{
					var ParentStat = fs.statSync(Address);
					if(ParentStat.isDirectory())
					{
						stream.respond({ ':status': 200, 'Content-Type': 'text/html; charset=utf-8' });
						fs.readdir(Address, (err, __files) => 
						{
							if(!err)
							{
								var skin = fs.readFileSync(`./skin/anta.html`,'utf8');
								stream.write(skin);
								
								let file_length = __files.length;
								for(var i=0; i<file_length; i++) 
								{
									var InstanceAddress = path.join(Address, __files[i]);
									var file_stats;
									try
									{
										file_stats = fs.statSync(InstanceAddress);
										__files[i] = encodeURI(__files[i]);
										__files[i] = __files[i].replace(/'/g, `&#39;`);
										__files[i] = __files[i].replace(/"/g, `&#34;`);
										//__files[i] = __files[i].replace(/'/g, "&#39;");
										//__files[i] = __files[i].replace(/"/g, "&#34;");
										if (file_stats.isDirectory())
										{
											directories.push({"name":__files[i], "stat": file_stats}); //stats.birthtime
										}
										else
										{
											files.push({"name":__files[i], "stat": file_stats}); //stats.birthtime , stats.ctime
										}
									}
									catch(err)
									{
										q.warn(`Error while pushing directory - ${err}`);
									}
								}
								Path = Path.replace(/'/g, `&#39;`);
								Path = Path.replace(/"/g, `&#34;`);
								Path = encodeURI(Path);
								
								var Data = {};
								Data.files = files;
								Data.directories = directories;
								Data.url = Path;
								
								Data = JSON.stringify(Data);
								stream.write(`<div id='data'><div id='list' data-list='${Data}'></div></div>`);
								q.done('Data Writed');
								stream.end();
							}
							else
							{
								stream.respond({ ':status': 500});
								stream.end(`Error while reading directory : ${err}`);
									q.error('Directory Error Occured!');
									q.error('----------------------');
									q.error(err);
									q.error('----------------------');
							}
						});
					}
					else if(ParentStat.isFile())
					{
						q.network(`Sending File... - ${Address}`,2);
						let path = Address;
						Path = Path.replace(`&#39;`, `'`);
						Path = Path.replace(`&#34;`, `"`);
						file_send(stream, headers, Address);
					}
					else
					{
						stream.respond({ ':status': 500});
						stream.end(`Error while determing type : It's not valid!`);
						q.warn(`Cannot determine file type - ${Address}`);
						//not valid
					}
				}
				else
				{
					stream.respond({ ':status': 500});
					stream.end(`Error while accessing file/folder : ${err}`);
					q.warn(`Cannot accessing file/folder - ${err}`);
				}
			});
		}
		else 
		{
			if(Path==`/`)
			{
				var skin = fs.readFileSync(`./skin/anta.html`,'utf8');
				stream.write(skin);
				
				var main = [];
				let shared_folder_length = Shared_Folder.length;
				for(var folder in Shared_Folder)
				{
					try{
						var stats = fs.statSync(Shared_Folder[folder]);
						if(stats)
						{
							main.push({"name":folder, "birth": stats.birthtime, "ctime": stats.ctime});
						}
						else
						{
							main.push({"name":folder, "birth": "", "ctime": ""});
							q.error(`unable to stat shared folder - ${folder}`);
						}
					}
					catch(err) {
						q.error(`unable to stat shared folder in try level - ${folder}, ${err}`);
					}
				}
				var data = {};
				data.directories = main;
				data.url = '';
				
				data = JSON.stringify(data)
				//var resultBuffer = encoding.convert(go, 'ASCII', 'UTF-8');
				//set div
				stream.end(`<div id='data'><div id='list' data-list='${data}'></div></div>`);
			}
			else
			{
				stream.respond({ ':status': 500});
				stream.end(`Error while accessing file/folder : it's not shared!`);
				q.warn(`${Address} - It was not shared`);
			}
		}
	}
});
server.listen(parseInt(port));
server.on('error', (err) => {
	q.error('Error occured in server!');
	q.error('----------------------');
	q.error(err);
	console.table(err);
	q.error('----------------------');
});
q.info(`Server listening on port ${port}`);

function file_send(stream, headers, address)
{
	fs.stat(address, (err, stat) =>
	{
		if(err)
		{
			q.warn(`error occured while sending a file! - ${err}`);
			stream.respond({ ':status': 500});
			stream.end(`Error occured while sending a file! : ${err}`);
			return;
		}
		else
		{
			try {
				let ext = path.extname(address);
				let type = mime.lookup(ext);
				
				//const stat = fs.statSync(address);
				const fileSize = stat.size;
				const range = headers.range;
				
				if (range) {
					const parts = range.replace(/bytes=/, "").split("-")
					const start = parseInt(parts[0], 10)
					const end = parts[1] 
					? parseInt(parts[1], 10)
					: fileSize-1
					const chunksize = (end-start)+1
					const file = fs.createReadStream(address, {start, end})
					const head = {
						'Content-Range': `bytes ${start}-${end}/${fileSize}`,
						'Accept-Ranges': 'bytes',
						'Content-Length': chunksize,
						'Content-Type': (type) ? type : 'application/octet-stream',
						':status': 206,
					};
					if(stream.destroyed)
					{
						q.warn(`${address} - stream destroyed and no longer use`);
						return;
					}
					stream.respond(head);
					file.pipe(stream);
					var destroied = false;
					stream.session.on('close', () => 
					{
						if(!destroied) {
							file.unpipe();
							file.destroy();
							destroied = true;
						}
						else {
							q.warn(`${address} already destroied`);
						}
					});
					stream.on('aborted', () => {
						q.warn(`${address} - connection aborted!`);
						if(!destroied) {
							file.unpipe();
							file.destroy();
							destroied = true;
						}
						else {
							q.warn(`${address} already destroied`);
						}
					});
					/*
					stream.session.setTimeout(2000);
					stream.session.on('timeout', () => 
					{
						file.unpipe();
						file.destroy();
						q.warn('session time outed and all stream destroied');
					});
					*/
					file.on('end', () => {
						q.done(`${address} - All the data in the file has been read`);
					}).on('close', (err) => {
						q.info(`${address} - Stream has been destroyed and file has been closed`);
					});
				}
				else {
					const head = {
						'Content-Length': fileSize,
						'Content-Type': (type) ? type : 'text/plain',
					}
					if(stream.destroyed)
					{
						q.warn(`${address} - stream destroyed and no longer use`);
						return;
					}
					stream.respond(head);
					const file = fs.createReadStream(address).pipe(stream)
					var destroied = false;
					stream.session.on('close', () => 
					{
						if(!destroied) {
							file.unpipe();
							file.destroy();
							destroied = true;
						}
						else {
							q.warn(`${address} already destroied`);
						}
					});
					stream.on('aborted', () => {
						if(!destroied) {
							file.unpipe();
							file.destroy();
							destroied = true;
						}
						else {
							q.warn(`${address} already destroied`);
						}
						q.warn(`${address} - connection aborted!`);
					});
					file.on('end', () => {
						q.done(`${address} - All the data in the file has been read`);
					}).on('close', (err) => {
						q.info(`${address} - Stream has been destroyed and file has been closed`);
					});
					/*
					stream.session.setTimeout(2000);
					stream.session.on('timeout', () => 
					{
						file.unpipe();
						file.destroy();
						q.warn('session time outed and all stream destroied');
					});
					*/
				}
			}
			catch(err) {
				q.error(`unknown error while sending files! ${err}`);
			}
		}
	});
}


/*
command
*/



var stdin = process.openStdin();
stdin.addListener("data", (d) => { //input
	var get = d.toString().trim().split(" ");
	if (get[0] == "add")
		{
			var par = d.toString().trim().split(`"`);
			if (par[1] == null || par[3] == null) 
			{
				q.error('It\'s not vaild value.')
			}
			else if (Shared_Folder[par[3]])
			{
				q.info(`${par[1]} Was already listed  ${par[3]}`)
			}
			else
			{
				Shared_Folder[par[3]] = par[1]; //fake : real
				q.done(`${par[1]} Was shared to ${par[3]}`)
			}
		}
	if (get[0] == "del")
	{
		var par = d.toString().trim().split(`"`);
		for(var folder in Shared_Folder)
		{
			q.info(folder + folder.keys);
		}
		
		if(Shared_Folder[par[1]])
		{
			delete Shared_Folder[par[1]]; //undefined? delete?
			q.warn(`${par[1]} was deleted`);
		}
		else
		{
			q.error(`${par[1]} was not exist`);
		}
	}
	if (get[0] == "get")
	{
		for(var folder in Shared_Folder)
		{
			q.info(folder + folder.keys);
		}
	}
	if (get[0] == "sav")
	{
		var stream = fs.createWriteStream("server.cfg");
		stream.once('open', function(fd) {
			stream.write(JSON.stringify(Shared_Folder));
			stream.end();
		});
		q.info('Saved');
	}
	if (get[0] == "lod")
	{
		
	}
 });