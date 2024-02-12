var list_subtitle = [];
var hostid=-1;
var videoIntvls=[];
function video_init(view, name)
{
	hostid=-1;
	videoIntvls=[];
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
	let lss=["kr", "en", "es", "un"];
	for(var i=0; i<list_subtitle_length; i++)
	{
		var caption = view.replace(view.substring(view.lastIndexOf('/')+1, view.length), list_subtitle[i]); 
		
		var player_caption = doc.createElement("track");
		player_caption.kind = "captions";
		player_caption.label = `${list_subtitle[i]}`;
		player_caption.srclang = lss[i];
		player_caption.src = `?convsub=${caption}`;
		console.log(name.substring(0, name.lastIndexOf('.')) + ` !!!!!!!!!!!!!!!!! ${list_subtitle[i].substring(0, list_subtitle[i].lastIndexOf('.'))}`);
		if(name.substring(0, name.lastIndexOf('.')) == list_subtitle[i].substring(0, list_subtitle[i].lastIndexOf('.')))
		{
			player_caption.default = true;
			//player_caption.mode = "showing";
			//player_caption.srclang = lss[i];
			console.log(`right!`);
		}
		player_element.appendChild(player_caption);
	}
	console.log(caption);
	wrap.appendChild(player_element);
	//<button class="custom-btn btn-13">Read More</button>
	let PartyHost=doc.createElement("button");
	let PartyGuest=doc.createElement("button");
	let PartyID=doc.createElement("input");
	PartyHost.classList = "custom-btn btn-13";
	PartyGuest.classList = "custom-btn btn-13";
	PartyHost.innerHTML = "Host";
	PartyGuest.innerHTML = "Guest";
	PartyID.type = "text";
	PartyID.placeholder="Party ID";
	PartyHost.onclick = async () => {
		let id = await fetch(`?party=create`);
		if(!id.ok) {
			alert("Failed to create party");
			return;
		}
		hostid = await id.text();
		PartyID.value = hostid;
		let intvl = setInterval(async () => {
			let slider = doc.getElementById('wrap');
			let isOpen = slider.classList.contains('slide-in');
			if(!isOpen) {
				clearInterval(intvl);
				return;
			}
			let time = player.currentTime;
			let result = await fetch(`?party=sync&id=${hostid}&time=${time}&paused=${player.paused}`);
			if(!result.ok) {
				alert("Failed to sync");
				clearInterval(intvl);
				return;
			}
		}, 1000);
		videoIntvls.push(intvl);
	}
	PartyGuest.onclick = async () => {
		let intvl = setInterval(async () => {
			let slider = doc.getElementById('wrap');
			let isOpen = slider.classList.contains('slide-in');
			if(!isOpen) {
				clearInterval(intvl);
				return;
			}
			let roomid = PartyID.value;
			let result = await fetch(`?party=get&id=${roomid}`);
			if(!result.ok) {
				alert("Failed to sync");
				clearInterval(intvl);
				return;
			}
			let resultJson = await result.json();
			console.log(resultJson)
			const resultTime = resultJson[0];
			const resultPaused = resultJson[1];
			if((resultPaused) || (!resultPaused && Math.abs(resultTime-player.currentTime) > 1)) {
				//detect if player is buffering


				player.currentTime = resultTime;
				if(resultPaused) player.pause();
				else player.play();
			}
		}, 500);
		videoIntvls.push(intvl);
	}
	wrap.appendChild(PartyHost);
	wrap.appendChild(PartyGuest);
	wrap.appendChild(PartyID);
	player = new Plyr(player_element,
	{
		//iconUrl: "?resource=/css/plyr.svg", 
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
	videoIntvls.push(setInterval(checkBuffering, checkInterval))
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
var checkInterval  = 50.0 // check every 50 ms (do not use lower values)
var lastPlayPos    = 0
var currentPlayPos = 0
var bufferingDetected = false

function checkBuffering() {
    currentPlayPos = player.currentTime

    // checking offset should be at most the check interval
    // but allow for some margin
    var offset = (checkInterval - 20) / 1000

    // if no buffering is currently detected,
    // and the position does not seem to increase
    // and the player isn't manually paused...
    if (
            !bufferingDetected 
            && currentPlayPos < (lastPlayPos + offset)
            && !player.paused
        ) {
        console.log("buffering")
        bufferingDetected = true
    }

    // if we were buffering but the player has advanced,
    // then there is no buffering
    if (
        bufferingDetected 
        && currentPlayPos > (lastPlayPos + offset)
        && !player.paused
        ) {
        console.log("not buffering anymore")
        bufferingDetected = false
    }
    lastPlayPos = currentPlayPos
}