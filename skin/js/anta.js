function formatSeconds(seconds) {
  var date = new Date(1970, 0, 1);
  date.setSeconds(seconds);
  return date.toTimeString().replace(/.*(\d{2}:\d{2}).*/, "$1");
}

const __info =
`
ANTA - Being develop
Made by Hisman Yosika
`

const resfix = "?action=Resource&file=";
doc.body.className += 'progress';

function Create(callback) 
{
  var data = {};
  return { 
    getData   : function()  { return data; },
    setData   : function(p) { data = p; callback(data); },
  };
}

let data = Create(function(data)
{
	console.log("Callback");
	if(data)
	{
		listdata(data);
	}
});

var getCookie = function(name) {
  var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return value? value[2] : null;
};

//doc.getElementById('list').getAttribute('data-list');
function work()
{
	do
	{
		if(doc.getElementById('list'))
		{
			console.log("Found Element");
			let element = doc.getElementById('list').getAttribute('data-list');
			let json = JSON.parse(element);
			data.setData(json);
		}
	} while(!doc.getElementById('list'));
}

//.replace(`"`, "&#34;").replace("'", "&#39;")

data.innerHTML = "";
work();

function listdata(data)
{
	var files = data.files;
	var dirs = data.directories;
	var url = data.url;
	
	var buf = "";
	// 디렉터리
	if(dirs)
	{
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
			//var name = dirs[i].name.replace("'", "&#39;");
			var name = decodeURI(dirs[i].name);
			var preview = `${resfix}skin/icon/ico_folder.png`;
			var link = `${url}/${name}`;
			var type = "folder";
			
			buf +=
			`<a id="element#${name}" class="element" data-type="${type}" data-link="${link}" title="${name}" onclick='return handler(this);' href="${link}">` +
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
			`</a>`;
		}
	}
	if(files)
	{
		files.sort(function(A, B) 
		{ 
		//alert(A[0].split(".")[0].toLowerCase() + " " +  B[0].split(".")[0].toLowerCase() + " isnan " + isNaN(A[0].split(".")[0]))
			if(!isNaN(A.name.split(".")[0]) && !isNaN(B.name.split(".")[0])) 
			{
				//alert( A[0].split(".")[0] - B[0].split(".")[0] ) 
				let temp = A.name.split(".")[0] - B.name.split(".")[0];
				if(temp) return A.name.split(".")[0] - B.name.split(".")[0];
				else 
				{
					console.log(`Same name`);
					return A.name.split(".")[1].toLowerCase().localeCompare(B.name.split(".")[1].toLowerCase()); 
				}
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
		const subf = /\.(ass|vtt|srt|lrc|sbv|smi|ssa|sub)$/i;
		const caption = "";
		
		var file_length = files.length;
		var image_index = 0;
		for(i=0; i<file_length; i++)
		{
			if(/^(pagefile\.sys|hiberfil\.sys|swapfile\.sys|desktop\.ini|thumbs\.db)$/i.test(files[i].name)) continue;
			
			//var name = files[i].name.replace("'", "&#39;");
			var name = decodeURI(files[i].name);
			var preview = `${resfix}skin/icon/ico_file.png`;
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
				preview = `${resfix}skin/icon/ico_video.png`;
				type = "video";
			}
			else if(audf.test(name))
			{
				preview = `${resfix}skin/icon/ico_audio.png`;
				type = "audio";
			}
			else if(txtf.test(name))
			{
				preview = `${resfix}skin/icon/ico_text.png`;
				type = "text";
			}
			else if(exef.test(name))
			{
				preview = `${resfix}skin/icon/ico_exe.png`;
				type = "execute";
			}
			else if(isof.test(name))
			{
				preview = `${resfix}skin/icon/ico_iso.png`;
				type = "disk";
			}
			else if(zipf.test(name))
			{
				preview = `${resfix}skin/icon/ico_zip.png`;
				type = "zip";
			}
			else if(subf.test(name))
			{
				preview = `${resfix}skin/icon/ico_sub.png`;
				type = "sub";
				list_subtitle.push(name);
			}
			image_index_buf = (type=="image") ? `data-index=${image_index}` : null;
			if(image_index_buf) image_index++;
			buf +=
			`<div id="element#${name}" class="element" data-type="${type}" data-link="${link}" title="${name}" ${image_index_buf} onclick='return handler(this);' href="${link}">` +
				`<div id="highlight#${name}" class="highlight">` +
					`<div id="content#${name}" class="content">` +
						`<div id="el_img#${name}" class="el_img">` +
							`<img id="view#${name}" class="el_view" data-src="${preview}" src="${preview}">` +
						`</div>` +
						`<div id="el_name#${name}" class="el_name">` +
							`${name}` +
						`</div>` +
					`</div>` +
				`</div>` +
			`</div>`;
		}
	}
	if(!buf) buf = `<div class="init">이 폴더는 비어 있습니다.</div>\n`;
	
	buf += `<div style="clear: both;"></div>`;
	
	doc.getElementById("form").innerHTML = buf;
	doc.body.className = doc.body.className.replace("progress", "");
	//var myLazyLoad = new LazyLoad();
	init_swiper();
}

function handler(element)
{
	var link = element.getAttribute("data-link")
	var type = element.getAttribute("data-type")
	var index = element.getAttribute("data-index")
	var name = element.getAttribute("title");
	
	switch(type)
	{
		case "folder":
			location.href = link;
			break;
		case "file":
			window.open(link);
			break;
		case "image":
			wrap_slide("image") 
			mySwiper.slideTo(index, 0, false);
			//transition_fullscreen(element);
			break;
		case "video":
			wrap_slide("video");
			video_init(link, name);
			break;
		case "audio":
			wrap_slide("audio");
			audio_init_wrap(name, '');
			audio_init(link); 
			break;
		default:
			window.open(link);
			break;
	}
	return false; //https://stackoverflow.com/questions/14867558/html-tag-a-want-to-add-both-href-and-onclick-working
}

function wrap_slide(type)
{
	console.log('wrap slied!');
	var slider = doc.getElementById('wrap');
	var isOpen = slider.classList.contains('slide-in');
    slider.setAttribute('class', isOpen ? 'slide-out' : 'slide-in');
	doc.getElementById('view').setAttribute('class', isOpen ? 'article-close' : 'article-open');
	if(!isOpen)
	{
		slider.innerHTML = `<a onclick=wrap_slide("${type}"); class="close"></a>`
	}
	
	switch(type)
	{
		case "image":
			if(!isOpen)
			{
				init_image();
				init_swiper();
			}
			break;
		case "video":
			if(isOpen)
			{
				
				var videoElement = document.getElementById('wrap_video');
				videoElement.pause();
				videoElement.src =`${resfix}skin/blank.mp4`; // empty source
				videoElement.load();
				
				player.destroy();
			}
			break;
		case "settings":
			if(!isOpen)
			{
				doc.getElementById('wrap').innerHTML +=
				`
				<br><br><br>
				<br><br><br>
				<br><br><br>
				<div style='color:white; font-size:5em;'>Toggle#만화 스크롤</div>
				<div class="toggle">
					<input type="checkbox" class="check" id="swiper_freescroll">
					<b class="b switch"></b>
					<b class="b track"></b>
				</div>
				`;
			}
			else
			{
				settings['swiper_freescroll'] = doc.getElementById('swiper_freescroll').checked;
				doc.cookie = `swiper_freescroll=${settings['swiper_freescroll']}`;
			}
			break;
		case "audio":
			if(isOpen)
			{
				audio.pause();
			}
			break;
	}
};

function transition_fullscreen(element) //element : el_img
{
	var img = element.getElementsByClassName('el_view')[0];
	img.classList.add('full');
}

/*
function dropHandler(ev) {
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        console.log('...() file[' + i + '].name = ' + file.name);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  } 
  
  // Pass event to removeDragData for cleanup
  removeDragData(ev)
}
function dragOverHandler(ev) {
  console.log('File(s) in drop zone'); 
  doc.getElementById("article").className = (ev.type === 'dragover' ? 'show' : '');
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function removeDragData(ev) {
  console.log('Removing drag data')

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to remove the drag data
    ev.dataTransfer.items.clear();
  } else {
    // Use DataTransfer interface to remove the drag data
    ev.dataTransfer.clearData();
  }
}
 ondrop="dropHandler(event);" ondragenter="dragOverHandler(event);" ondragleave="dragOverHandler(event);"
*/