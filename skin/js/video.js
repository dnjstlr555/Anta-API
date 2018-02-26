function wrap_video(view)
{
	var wrap = doc.getElementById("wrap");
		
	if(doc.getElementById("wrap_video")) wrap.removeChild(doc.getElementById("wrap_video"));
	
	var player_element = doc.createElement("video");
	player_element.loop = true;
	player_element.setAttribute("id", "wrap_video");
	
	wrap.appendChild(player_element);

	player_element.setAttribute("src", view);
	
	player = plyr.setup(player_element, 
	{
		iconUrl: "?action=Resource&file=skin/css/plyr.svg", 
		autoplay: true,
		seekTime: 3,
		disableContextMenu: false,
		tooltips: {
			controls: true,
			seek: true,
		},
		i18n: {
			restart:            "Restart",
			rewind:             "Rewind {seektime} secs",
			play:               "Play",
			pause:              "Pause",
			forward:            "Forward {seektime} secs",
			buffered:           "buffered",
			currentTime:        "Current time",
			duration:           "Duration",
			volume:             "Volume",
			toggleMute:         "Toggle Mute",
			toggleCaptions:     "Toggle Captions",
			toggleFullscreen:   "Toggle Fullscreen"
		},
	})
	player[0].on('error', function(event) {
		alert(`Error while playing video. Unsupported Format may cause this problem \n:(`);
		wrap_slide('video')
	});
}