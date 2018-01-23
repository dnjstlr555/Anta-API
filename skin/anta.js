const resfix = "?action=Resource&file=";
var data = JSON.parse(doc.getElementById("list").getAttribute("data-list"));

data.innerHTML = "";
listdata(data);

function listdata(data)
{
	var files = data.files;
	var dirs = data.directories;
	var url = data.url;
	
	var buf = "";
	// 디렉터리
	dirs.sort(function(A, B) 
	{ 	
		if(!isNaN(A.name.split(".")[0]) && !isNaN(B.name.split(".")[0])) 
		{
			return A.name.split(".")[0] - B.name.split(".")[0];
		}
		return A.name.split(".")[0].toLowerCase().localeCompare(B.name.split(".")[0].toLowerCase()); 
	});
	
	var i;
	var dir_length = dirs.length;
	for(i=0; i<dir_length; i++)
	{
		var name = dirs[i].name.replace("'", "&#39;");
		
		var preview = `${resfix}skin/ico_folder.png`;
		var link = `${url}/${name}`;
		var type = "folder";
		
		buf +=
		`<div id="element#${name}" class="element" data-type="${type}" data-link="${link}" onclick=handler(this)>` +
			`<div id="highlight#${name}" class="highlight">` +
				`<div id="content#${name}" class="content">` +
					`<div id="el_img#${name}" class="el_img">` +
						`<img class="view#${name}" src="${preview}">` +
					`</div>` +
					`<div id="el_name#${name}" class="el_name">` +
						`${name}` +
					`</div>` +
				`</div>` +
			`</div>` +
		`</div>`;
	}
	
	files.sort(function(A, B) 
	{ 
	//alert(A[0].split(".")[0].toLowerCase() + " " +  B[0].split(".")[0].toLowerCase() + " isnan " + isNaN(A[0].split(".")[0]))
		if(!isNaN(A.name.split(".")[0]) && !isNaN(B.name.split(".")[0])) 
		{
			//alert( A[0].split(".")[0] - B[0].split(".")[0] ) 
			return A.name.split(".")[0] - B.name.split(".")[0];
		}
		return A.name.split(".")[0].toLowerCase().localeCompare(B.name.split(".")[0].toLowerCase()); 
	});
	
	const imgf = /\.(bmp|gif|jpe|jpg|jpeg|png)$/i;
	const vidf = /\.(3g2|3gp|3gp2|3gpp|asf|avi|divx|flv|k3g|m1v|m2t|m2ts|m2v|m4v|mkv|mov|mp2v|mp4|mpv2|mpg|mpeg|ogm|ogv|qt|rmvb|tp|ts|webm|wm|wmv)$/i;
	const audf = /\.(aac|aif|aifc|aiff|au|cda|fla|flac|kar|m4a|mid|midi|mka|mp1|mp2|mp3|mpa|mpc|oga|ogg|opus|snd|wav|wave|wma|wv)$/i;
	const txtf = /\.(txt|doc|rtf|cfg|conf|config|log|inf|ini)$/i;
	const exef = /\.(exe|msi|msu|msp)$/i;
	const isof = /\.(b5t|bin|bwt|cdi|img|iso|isz|lcd|mds|nrg|pdi|vcd)$/i;
	const zipf = /\.(7z|ace|alz|arc|arj|b64|bh|bhx|bz|bz2|cab|ear|egg|enc|gz|ha|hqx|ice|lha|lzh|mim|pak|rar|tar|tbz|tbz2|tgz|uu|uue|war|xxe|z|zip|zoo)$/i;
	const caption = "";
	
	var file_length = files.length;
	for(i=0; i<file_length; i++)
	{
		if(/^(pagefile\.sys|hiberfil\.sys|swapfile\.sys|desktop\.ini|thumbs\.db)$/i.test(files[i].name)) continue;
		
		var name = files[i].name.replace("'", "&#39;");
		
		var preview = `${resfix}skin/ico_file.png`;
		var link = `${url}/${name}`;
		var type = "file";
		
		if(imgf.test(name))
		{
			preview = link;
			type = "image";
			imagelist.push(`<img class="gallery_img" src="${link}" title="${name}">`); 
		}
		else if(vidf.test(name))
		{
			preview = `${resfix}skin/ico_video.png`;
			type = "video";
		}
		else if(audf.test(name))
		{
			preview = `${resfix}skin/ico_audio.png`;
			type = "audio";
		}
		else if(txtf.test(name))
		{
			preview = `${resfix}skin/ico_text.png`;
			type = "text";
		}
		else if(exef.test(name))
		{
			preview = `${resfix}skin/ico_exe.png`;
			type = "execute";
		}
		else if(isof.test(name))
		{
			preview = `${resfix}skin/ico_iso.png`;
			type = "disk";
		}
		else if(zipf.test(name))
		{
			preview = `${resfix}skin/ico_zip.png`;
			type = "zip";
		}
		
		buf +=
		`<div id="element#${name}" class="element" data-type="${type}" data-link="${link}" onclick=handler(this); title="${name}">` +
			`<div id="highlight#${name}" class="highlight">` +
				`<div id="content#${name}" class="content">` +
					`<div id="el_img#${name}" class="el_img">` +
						`<img id="view#${name}" class="el_view" src="${preview}">` +
					`</div>` +
					`<div id="el_name#${name}" class="el_name">` +
						`${name}` +
					`</div>` +
				`</div>` +
			`</div>` +
		`</div>`;
	}
	if(!buf) buf = "<div class=\"init\">이 폴더는 비어 있습니다.</div>\n";
	
	buf += `<div style="clear: both;"></div>`;
	
	doc.getElementById("form").innerHTML = buf;
	init_swiper();
}

function handler(element)
{
	var link = element.getAttribute("data-link")
	var type = element.getAttribute("data-type")
	
	switch(type)
	{
		case "file":
			window.open(link);
			break;
		case "image":
			window.open(link);
			break;
		case "video":
			wrap_slide("video");
			wrap_video(link);
			break;
		default:
			location.href = link;
			break;
	}
}

function wrap_slide(type)
{
	var $slider = doc.getElementById('wrap');
	var isOpen = $slider.classList.contains('slide-in');
    $slider.setAttribute('class', isOpen ? 'slide-out' : 'slide-in');
	
	if(!isOpen)
	{
		$slider.innerHTML = `<a onclick=wrap_slide("${type}"); class="close"></a>`
	}
	
	switch(type)
	{
		case "img":
			if(!isOpen)
			{
				init_image();
				init_swiper();
			}
			break;
		case "video":
			if(isOpen)
			{
				plyr.get()[0].pause();
			}
			break;
	}
};