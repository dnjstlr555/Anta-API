const http = require('http');
const { url, URLSearchParams } = require('url');
const fs = require('fs');
const path = require('path');
const port = process.argv[2] || 9000;
/*
	ANTA_API 
*/
	
	

var folderlist = {};
function __log(info,text)
{
	console.log('['+info+'] ' + text);
}
function syncafter(file, dir, url, res)
{
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
			res.write(`<div id="data"><div id="list" data-list='${go}'></div></div>`);
			console.log('resource writed');
			res.write(html);
			res.end(); 
		}
	});
}

var settings;
var f = fs.readFile('file', 'utf8', function (err, data) {
  if (!err) settings = JSON.parse(data);
});
if(settings)
{
	folderlist = settings;
	__log('info','Loaded Settings');
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
					sendFile(address, response);
				}
				else
				{
					response.statusCode = 404;
					response.end(`Error - No such file on resource!`);
					__log('error', ` No such file on resource! - ${request.connection.remoteAddress}`);
				}
			}
			else
			{
				response.statusCode = 404;
				response.end(`Error - No such file on resource!`);
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
								sendFile(realAddress, response);
								__log('Network', `File Sent - ${realAddress} - ${request.connection.remoteAddress}`);
							}
							else //it's not vaild
							{
								response.statusCode = 404;
								response.end(`Error - Not Vaild!`);
								__log('error', `Not Vaild - File/Folder was not vaild(Not a folder, Not a file) - ${request.connection.remoteAddress}`);
							}
						}
						else
						{
							response.statusCode = 404;
							response.end(`Error - Not Real Directory!`);
							__log('error', `Not Real Directory - Given address was not exists - ${request.connection.remoteAddress}`);
						}
					});
				}
				else
				{
					response.statusCode = 404;
					response.end(`Error - Not Real Directory!`);
					__log('error', `Not Real Directory - Shared folder was not exist - ${request.connection.remoteAddress}`);
				}
			});
		}
		else 
		{
			response.statusCode = 404;
			response.end(`Error - No such folder!`);
			__log('error', `No such folder - It's not shared - ${request.connection.remoteAddress}`);
		}
	}
}).listen(parseInt(port));
__log('info', `Server listening on port ${port}`);



function sendFile(address, response)
{ //https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http
	__log('dev',address);
	var pathname = address;
	// based on the URL path, extract the file extention. e.g. .js, .doc, ...
	const ext = path.extname(pathname);
	// maps file extention to MIME typere
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
		'.doc': 'application/msword'
	};
	
	fs.exists(pathname, function (exist) {
		if(!exist) {
			// if the file is not found, return 404
			response.statusCode = 404;
			response.end(`Error : File ${pathname} not found!`);
			return;
		}

		// if is a directory search for index file matching the extention
		if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;

		// read file from file system
		fs.readFile(pathname, function(err, data){
			if(err){
				response.statusCode = 500;
				response.end(`Error : Error getting the file: ${err}.`);
			} else {
			// if the file is found, set Content-type and send data
				response.setHeader('Content-type', map[ext] || 'text/plain' );
				response.end(data);
			}
		});
	});
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
