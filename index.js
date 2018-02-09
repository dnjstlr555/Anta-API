const http = require('http');
const { url, URLSearchParams } = require('url');
const fs = require('fs');
const path = require('path');
const port = process.argv[2] || 9000;
const maxfilesize = 1073741000; //1GigaBytes-1000
const mime = require('mime-types');
/*
	ANTA_API 
*/

var folderlist = {};
var settings = {};


try
{ 
	settings = fs.readFileSync('server.cfg','utf8');
}
catch(e)
{
	
}
if(settings)
{
	folderlist = settings;
	__log('info','Loaded Settings');
}


function __log(info,text)
{
	console.log('['+info+'] ' + text);
}
function syncafter(file, dir, url, res)
{
	//set settings.skin
	fs.readFile('./skin/anta.html', (err, html) => {
		if (err) {
				res.statusCode = 404;
				res.end(`Error - No such file on resource!`);
			__log('error','damn!'); 
		} 
		else
		{
			var tmp = new Object();
			tmp.files = file;
			tmp.directories = dir;
			tmp.url = url;
			var go = JSON.stringify(tmp)
			//var resultBuffer = encoding.convert(go, 'ASCII', 'UTF-8');
			//set div
			res.write(`<div id="data"><div id="list" data-list='${go}'></div></div>`);
			console.log('resource writed');
			res.write(html);
			res.end(); 
		}
	});
}
function response_end(response, statusCode, end)
{
	//set settings.onend
	response.statusCode = statusCode;
	response.end(end);
}

let params;
const server = http.createServer(function (request, response) 
{
	__log('Network', `${request.method} ${request.url} from ${request.connection.remoteAddress}`);
    //console.log('request ', request.url, ' from', request.connection.remoteAddress);
	var decodedURL = decodeURI(request.url)
	var rq = decodedURL.split('/');
	var par = decodedURL.split('?');
	params = new URLSearchParams(par[1]);
	var files = [];
	var directories = [];
	
	if(par[1])
	{
		params = new URLSearchParams(par[1]);
		if(params.has('action'))
		{
			var data = params.get('action');
			if(data == "Resource")
			{
				var file = params.get('file');
				if(file)
				{
					var address = path.join('./', file);
					sendFile(request, address, response);
				}
				else
				{
					response_end(response, 404, `Error - No such file on resource!`);
					__log('error', ` No such file on resource! - ${request.connection.remoteAddress}`);
				}
			}
			else
			{
				response_end(response, 404, `Error - No such file on resource!`);
				__log('error', ` No such file on resource! - ${request.connection.remoteAddress}`);
			}
		}
	}
	else
	{
	
		if (folderlist[rq[1]]) //verify it's shared main folder
		{
			fs.exists(folderlist[rq[1]], (exists) => //main folder is exists?
			{
				if(exists) 
				{
					var realAddress = folderlist[rq[1]]; //join rest folder
					var full=rq.length;
					for(var rest=2; rest<full; rest++) 
					{
						if(rq[rest]) realAddress = path.join(realAddress, rq[rest]);
					}
					//**********realAddress must be not shown!!!!! its a real directory*********//
					fs.exists(realAddress, (ex) =>  //is exist?
					{
						if(ex) 
						{ 
							var vaild = fs.statSync(realAddress)
							if(vaild.isDirectory()) //is directory?
							{ //send list
								__log('Network', `List Sending - ${realAddress} - ${request.connection.remoteAddress}`);
								response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
								fs.readdir(realAddress, (err, __files) => 
								{
									if(!err)
									{
										var num=__files.length;
										for(var i=0; i<num; i++) 
										{
											var finalres = path.join(realAddress, __files[i]);
											var stats;
											try
											{
												stats = fs.statSync(finalres);
												//__files[i] = encodeURI(__files[i]);
												__files[i].replace(`"`, '');
												__files[i].replace(`'`,'');
												if (stats.isDirectory())
												{
													
													directories.push({"name":__files[i], "birth": stats.birthtime});
												}
												else 
												{
													files.push({"name":__files[i], "birth": stats.birthtime, "ctime": stats.ctime});
												}
											}
											catch(err)
											{
												
											}
										}
										syncafter(files, directories, decodedURL, response); //sync end of response
									}
								});
							}
							else if(vaild.isFile()) //is File?
							{
								sendFile(request, realAddress, response);
								__log('Network', `File Sent - ${realAddress} - ${request.connection.remoteAddress}`);
							}
							else //it's not vaild
							{
								response_end(response, 404, `Error - Not Vaild!`);
								__log('error', `Not Vaild - File/Folder was not vaild(Not a folder, Not a file) - ${request.connection.remoteAddress}`);
							}
						}
						else
						{
							response_end(response, 404, `Error - Not Real Directory!`);
							__log('error', `Not Real Directory - Given address was not exists - ${request.connection.remoteAddress}`);
						}
					});
				}
				else
				{
					response_end(response, 404, `Error - Not Real Directory!`);
					__log('error', `Not Real Directory - Shared folder was not exist - ${request.connection.remoteAddress}`);
				}
			});
		}
		else 
		{
			if(decodedURL==`/`)
			{
				var main = [];
				let folderlist_length = folderlist.length;
				for(var shown in folderlist)
				{
					var stats = fs.statSync(folderlist[shown]);
					if(stats)
					{
						main.push({"name":shown, "birth": stats.birthtime, "ctime": stats.ctime});
					}
					else
					{
						main.push({"name":shown, "birth": "", "ctime": ""});
					}
				}
				syncafter(null, main, '', response);
			}
			else
			{
				response_end(response, 404, `Error - No such folder!`);
				__log('error', `No such folder - It's not shared - ${request.connection.remoteAddress}`);
			}
		}
	}
}).listen(parseInt(port));
__log('info', `Server listening on port ${port}`);



function sendFile(request, address, response)
{ //https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http
	__log('dev',address);
	var pathname = address;
	// based on the URL path, extract the file extention. e.g. .js, .doc, ...
	let ext = path.extname(pathname);
	let type = mime.lookup(ext);
	// maps file extention to MIME typere
	
	//set map
	if(fs.existsSync(pathname))
	{
		let stat=fs.statSync(pathname)
		let size = stat.size;
		if(request.headers['range'])
		{
			let range = request.headers.range;
			let parts = range.replace(/bytes=/, "").split("-");
			let partialstart = parts[0];
			let partialend = parts[1];

			let start = parseInt(partialstart, 10);
			let end = partialend ? parseInt(partialend, 10) : size-1;
			let chunksize = (end-start)+1;
			console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
			try
			{
				let file = fs.createReadStream(pathname, {start: start, end: end});
				response.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + size, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': (type) ? type : 'video/mp4'});
				file.pipe(response);
			}
			catch(err)
			{
				response_end(response, 500, "Error while streaming file!");
			}
		}
		else
		{
			try
			{
				response.writeHead(200, {
					'Content-type': (type) ? type : null,
					'Content-Length' : size,
				});
				fs.createReadStream(pathname).pipe(response);
				console.log(size);
			}
			catch(err)
			{
				response_end(response, 500, "Error while sending file!");
			}
		}
	}
	else 
	{
		// if the file is not found, return 404
		response_end(response, 404, `Error : File ${pathname} not found!`);
		return;
	}
}


/*
command
*/



var stdin = process.openStdin();
stdin.addListener("data", function(d) { //input
	var get = d.toString().trim().split(" ");
	if (get[0] == "add")
		{
			var par = d.toString().trim().split(`"`);
			if (par[1] == null || par[3] == null) 
			{
				__log('error','It\'s not vaild value.')
			}
			else if (folderlist[par[3]])
			{
				__log('info',`${par[1]} Was already listed  ${par[3]}`)
			}
			else
			{
				folderlist[par[3]] = par[1]; //fake : real
				__log('info',`${par[1]} Was shared to ${par[3]}`)
			}
		}
	if (get[0] == "del")
	{
		var par = d.toString().trim().split(`"`);
		for(var folder in folderlist)
		{
			__log('info',folder, folder.keys);
		}
		
		if(folderlist[par[1]])
		{
			delete folderlist[par[1]]; //undefined? delete?
			__log('alert',`${par[1]} was deleted`);
		}
		else
		{
			__log('alert',`${par[1]} was not exist`);
		}
	}
	if (get[0] == "get")
	{
		for(var folder in folderlist)
		{
			__log('info',folder, folder.keys);
		}
	}
	if (get[0] == "sav")
	{
		var stream = fs.createWriteStream("server.cfg");
		stream.once('open', function(fd) {
			stream.write(JSON.stringify(folderlist));
			stream.end();
		});
		__log('info','Saved');
	}
	if (get[0] == "lod")
	{
		
	}
 });
 
 
 /*
		var stat=fs.statSync(pathname)
		if(stat.size > maxfilesize)
		{
			response_end(response, 501, `Error : File ${pathname} was up to 1 Gb!`);
			return;
		}
		// if is a directory search for index file matching the extention
		if (stat.isDirectory()) pathname += '/index' + ext;
		
		fs.readFile(pathname, function(err, data){
			if(err){
				response_end(response, 500, `Error : Error getting the file: ${err}.`);
			} else {
			// if the file is found, set Content-type and send data
				response.setHeader('Content-type', map[ext] || 'text/plain' );
				response.end(data);
			}
		});
		
		
		const map = {
		'.ico': 'image/x-icon',
		'.html': 'text/html',
		'.js': 'text/javascript',
		'.json': 'application/json',
		'.css': 'text/css',
		'.png': 'image/png',
		'.jpg': 'image/jpeg',
		'.wav': 'audio/wav',
		'.mp3': 'audio/mpeg',
		'.svg': 'image/svg+xml',
		'.pdf': 'application/pdf',
		'.doc': 'application/msword',
		'.mp4': 'video/mp4',
		'.webm':''
	};
		*/
