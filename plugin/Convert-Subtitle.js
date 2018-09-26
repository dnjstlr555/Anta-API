exports.type = "URLSearchParams"
exports.name = "Convert-Subtitle"

exports.func = (stream, headers) =>
{
	console.log("=======[We are In Convert]======");
	var file = params.get('file');
	if(file)
	{
		file = file.split(`/`);
		var real_address = address_toReal(file);
		if(real_address)
		{
			if(fs.existsSync(real_address))
			{
				var stats = fs.statSync(real_address);
				if(stats.isDirectory())
				{
					response_end(response,`Error - It's not file!`, 404);
				}
				else if(stats.isFile())
				{
					var sub = fs.readFileSync(real_address);
					//var encode = jschardet.detect(sub);
					//console.log(encode);
					var encode2 =  chardet.detect(sub);
					console.log("sec " + encode2);
					sub = iconv.decode(sub, encode2); //encode.encoding
					var sub_converted;
					try {
						sub_converted = subsrt.convert(sub, { format: 'vtt' });
						let type = mime.lookup('vtt');
						if(sub_converted)
						{
							response.writeHead(200, {
								'Content-type': (type) ? type : null,
								'charset':'utf-8',
							});
							response_end(response, sub_converted, 200);
						}
						else
						{
							response_end(response, `unexcepted error while converting sub`, 500);
						}
					}
					catch(err) {
						response_end(response, `unexcepted error while converting sub : ${err}`, 500);
					}
				}
				else
				{
					response_end(response, `error emh`, 500);
				}
			}
			else
			{
				response_end(response, `it's not here moron`, 404);
			}
		}
		else
		{
			response_end(response, `it's not shared huh`, 404);
		}
	}
	else
	{
		response_end(response,`Error - No such file on resource!`, 404);
		__log('error', ` No such file on resource! - ${request.connection.remoteAddress}`);
	}
}