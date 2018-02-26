var imagelist = [];
var mySwiper;
/*
function add_image(url, name, desc)
{
	document.getElementsByClassName("swiper-wrapper")[0].innerHTML +=
	`<div class="swiper-slide" style="background-image:url(${url})"></div>`;
}
*/
function init_image()
{
	document.getElementById("wrap").innerHTML =
	`<div class="swiper-container">` +
		`<a onclick=wrap_slide("img"); class="close"></a>` +
		`<div class="swiper-wrapper" id="gallery_wrapper"></div>` +
		`<div class="swiper-button-next swiper-button-white"></div> ` +
		`<div class="swiper-button-prev swiper-button-white"></div> ` +
		`<div class="swiper-pagination"></div>` +
	`</div>`;
}

function init_swiper()
{
	mySwiper = new Swiper ('.swiper-container', 
	{
		resistanceRatio: 0.1,
		speed: 700,
		direction: 'horizontal',
		navigation: 
		{
		  nextEl: '.swiper-button-next',
		  prevEl: '.swiper-button-prev',
		},
		pagination: 
		{
			el: '.swiper-pagination',
			dynamicBullets: true,
		},
		virtual: 
		{
			slides: imagelist,
		},
		slidesPerView: 1,
		roundLengths: true,
		keyboard: 
		{
			enabled: true,
			onlyInViewport: false,
		},
		mousewheel: 
		{
			invert: true,
		},
		spaceBetween: 1,
	}); 
}
