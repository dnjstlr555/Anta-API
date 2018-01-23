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
		iconUrl: "?action=Resource&file=skin/plyr.svg", 
		autoplay: true,
		seekTime: 3,
		disableContextMenu: false,
	});
}