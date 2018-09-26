function audio_init_wrap(SongName, SongArtist)
{
	doc.getElementById('wrap').innerHTML +=
			`
<div id='music-wrap'>
<div id="overlay"></div>
<header>
  <div id="menu-bar">
    <span></span>
    <span></span>
    <span></span>
  </div>
  <div id="song-info">
    <h1>${SongName}</h1>
    <p>${SongArtist}</p>
  </div>
  <div id="search">
    <i class="fa fa-search fa-2x"></i>
  </div>
</header>
<div id="content">
  <div id="range">
    <input type="range" id="range-val" value="46" min="0" max="143">
    <div id='tip'>Some tip</div>
  </div>
  <div id="time">
    <p id="current-time">0:46</p>
  </div>
  <div id="buttons">
    <div class="fa fa-step-backward fa-3x"></i>
    <div class="play" id='button_play' onclick=audio_pause_play(this);></i>
    <div class="fa fa-step-forward fa-3x"></i>
  </div>
  <div id="total-time">
    <p id="overall">2:23</p>
  </div>
</div>
<footer>
  <div id="repeat">
    <i class="fa fa-repeat"></i>
  </div>
  <div id="random">
    <i class="fa fa-random"></i>
  </div>
</footer>
</div>
			`;
}

function audio_init(source) 
{
	audio = document.createElement('audio');
	audio.src = source;
	audio.play();
	
	var audio_slider = doc.getElementById('range-val');
	var audio_ischange = false;
	audio.ontimeupdate = function(e)
	{
		if(!audio_ischange) audio_slider.value = audio.currentTime;
		doc.getElementById('current-time').innerHTML = formatSeconds(Math.floor(audio.currentTime));
	}
	audio.onloadeddata = function(e)
	{
		doc.getElementById('overall').innerHTML = formatSeconds(Math.floor(audio.duration));
		audio_slider.max = audio.duration;
		audio_slider.oninput = function()
		{
			audio.pause();
			audio_ischange = true;
			doc.getElementById('current-time').innerHTML = formatSeconds(Math.floor(audio_slider.value));
		}
		audio_slider.onchange = function()
		{
			audio.play();
			audio.currentTime = audio_slider.value;
			audio_ischange = false;
		}
	}
	var play = doc.getElementById('button_play');
	audio.onplay = function(e)
	{
		play.setAttribute('class', 'play pause');
	}
	audio.onpause = function(e)
	{
		play.setAttribute('class', 'play');
	}
}

function audio_pause_play(element)
{
	var isPause = element.classList.contains('pause');
	element.setAttribute('class', isPause ? 'play' : 'play pause');
	if(!isPause)
	{
		audio.play();
	}
	else
	{
		audio.pause();
	}
}
