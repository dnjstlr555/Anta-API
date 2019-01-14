var list_subtitle = [];

function video_init(view, name)
{
	var wrap = doc.getElementById("wrap");
	//wrap.innerHTML += `<button id="show-all">Show all</button>`;
	if(doc.getElementById("wrap_video")) wrap.removeChild(doc.getElementById("wrap_video"));
	//<track kind="captions" label="English captions" src="/path/to/captions.vtt" srclang="en" default>
	var player_element = doc.createElement("video");
	player_element.loop = true;
	player_element.class = "wrap_video";
	player_element.src = view;
	player_element.controls = true;
	player_element.autoplay = true;
	player_element.id = "wrap_video";
	
	let list_subtitle_length = list_subtitle.length;
	for(var i=0; i<list_subtitle_length; i++)
	{
		var caption = view.replace(view.substring(view.lastIndexOf('/')+1, view.length), list_subtitle[i]); 
		
		var player_caption = doc.createElement("track");
		player_caption.kind = "captions";
		player_caption.label = `${list_subtitle[i]}`;
		player_caption.srclang = "un";
		player_caption.src = `?action=Convert-Subtitle&file=${caption}`;
		console.log(name.substring(0, name.lastIndexOf('.')) + ` !!!!!!!!!!!!!!!!! ${list_subtitle[i].substring(0, list_subtitle[i].lastIndexOf('.'))}`);
		if(name.substring(0, name.lastIndexOf('.')) == list_subtitle[i].substring(0, list_subtitle[i].lastIndexOf('.')))
		{
			player_caption.default = true;
			//player_caption.mode = "showing";
			player_caption.srclang = "df";
			console.log(`right!`);
		}
		player_element.appendChild(player_caption);
	}
	console.log(caption);
	wrap.appendChild(player_element);
	
	player = new Plyr(player_element,
	{
		iconUrl: "?action=Resource&file=/css/plyr.svg", 
		seekTime: 3,
		disableContextMenu: false,
		tooltips: {
			controls: true,
			seek: true,
		},
		captions : {
			language: 'df', update: true
		},
	});
	player.on('error', function(e) {
		alert(e);
		console.log(e);
		wrap_slide('video');
	});
}//?action=Convert-Subtitle&file=${caption}

 function failed(e) {
   // video playback failed - show a message saying why
   switch (e.target.error.code) {
     case e.target.error.MEDIA_ERR_ABORTED:
       alert('You aborted the video playback.');
       break;
     case e.target.error.MEDIA_ERR_NETWORK:
       alert('A network error caused the video download to fail part-way.');
       break;
     case e.target.error.MEDIA_ERR_DECODE:
       alert('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.');
       break;
     case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
       alert('The video could not be loaded, either because the server or network failed or because the format is not supported.');
       break;
     default:
       alert('An unknown error occurred.');
       break;
   }
 }