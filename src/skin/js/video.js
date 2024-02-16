var list_subtitle = [];
var hostid = -1;
function video_init(view, name) {
	hostid = -1;
	var wrap = doc.getElementById("wrap");
	//wrap.innerHTML += `<button id="show-all">Show all</button>`;
	if (doc.getElementById("wrap_video")) wrap.removeChild(doc.getElementById("wrap_video"));
	//<track kind="captions" label="English captions" src="/path/to/captions.vtt" srclang="en" default>
	var player_element = doc.createElement("video");
	player_element.loop = true;
	player_element.class = "wrap_video";
	let extIndex = view.lastIndexOf(".") + 1;
	let ext = view.substring(extIndex, view.length);
	//if the extension of video is not mp4, use url like /movie?tomp4=video.mp4
	player_element.src = (ext == "mp4") ? view : `?tomp4=${name}`;
	console.log(player_element.src);
	player_element.controls = true;
	player_element.autoplay = true;
	player_element.id = "wrap_video";

	let list_subtitle_length = list_subtitle.length;
	// Plyr does not support choosing same language subtitle. SO I have to make it different.
	let lss = Object.keys(isoCountries).map((key) => {return key.toLowerCase()});

	for (var i = 0; i < list_subtitle_length; i++) {
		var caption = list_subtitle[i] //view.replace(view.substring(view.lastIndexOf('/')+1, view.length), list_subtitle[i]); 
		var player_caption = doc.createElement("track");
		player_caption.kind = "captions";
		player_caption.label = `${list_subtitle[i]}`;
		player_caption.srclang = lss[i];
		player_caption.src = `?convsub=${caption}`;
		console.log(name.substring(0, name.lastIndexOf('.')) + ` !!!!!!!!!!!!!!!!! ${list_subtitle[i].substring(0, list_subtitle[i].lastIndexOf('.'))}`);
		if (name.substring(0, name.lastIndexOf('.')) == list_subtitle[i].substring(0, list_subtitle[i].lastIndexOf('.'))) {
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
	let PartyHost = doc.createElement("button");
	let PartyGuest = doc.createElement("button");
	let PartyID = doc.createElement("input");
	PartyHost.classList = "custom-btn btn-13";
	PartyGuest.classList = "custom-btn btn-13";
	PartyHost.innerHTML = "Host";
	PartyGuest.innerHTML = "Guest";
	PartyID.type = "text";
	PartyID.placeholder = "Party ID";
	PartyHost.onclick = async () => {
		let id = await fetch(`?party=create`);
		if (!id.ok) {
			alert("Failed to create party");
			return;
		}
		hostid = await id.text();
		PartyID.value = hostid;
		let intvl = setInterval(async () => {
			let slider = doc.getElementById('wrap');
			let isOpen = slider.classList.contains('slide-in');
			if (!isOpen) {
				clearInterval(intvl);
				return;
			}
			let time = player.currentTime;
			let result = await fetch(`?party=sync&id=${hostid}&time=${time}&paused=${player.paused}`);
			if (!result.ok) {
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
			if (!isOpen) {
				clearInterval(intvl);
				return;
			}
			let roomid = PartyID.value;
			let result = await fetch(`?party=get&id=${roomid}`);
			if (!result.ok) {
				alert("Failed to sync");
				clearInterval(intvl);
				return;
			}
			let resultJson = await result.json();
			console.log(resultJson)
			const resultTime = resultJson[0];
			const resultPaused = resultJson[1];
			if ((resultPaused) || (!resultPaused && Math.abs(resultTime - player.currentTime) > 1)) {
				//detect if player is buffering
				player.currentTime = resultTime;
				if (resultPaused) player.pause();
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
			captions: {
				language: 'df', update: true
			},
		});
	player.on('error', function (e) {
		const plyr = e.detail.plyr;
		// original video is not documented in typescript
		// It's a reference to the <video> element which Plyr will override
		// A Plyr error won't happen in that element
		// const originalVideo = (plyr.elements as any).original;
		const container = plyr.elements.container;
		const plyrVideoEl =
			container && container.getElementsByTagName('video')[0];
		const plyrVideoError = plyrVideoEl?.error;
		console.log(plyrVideoError);
		failed(plyrVideoError);
		wrap_slide('video');
	});
}//?action=Convert-Subtitle&file=${caption}

function failed(e) {
	// video playback failed - show a message saying why
	switch (e.code) {
		case e.MEDIA_ERR_ABORTED:
			alert('You aborted the video playback.');
			break;
		case e.MEDIA_ERR_NETWORK:
			alert('A network error caused the video download to fail part-way.');
			break;
		case e.MEDIA_ERR_DECODE:
			alert('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.');
			break;
		case e.MEDIA_ERR_SRC_NOT_SUPPORTED:
			alert('The video could not be loaded, either because the server or network failed or because the format is not supported.');
			break;
		default:
			alert('An unknown error occurred.');
			break;
	}
}

//I hope there is a better way to handle the issue.
//https://gist.github.com/themeteorchef/dcffd74ca3ab45277c81
const isoCountries = {
    'AF' : 'Afghanistan',
    'AX' : 'Aland Islands',
    'AL' : 'Albania',
    'DZ' : 'Algeria',
    'AS' : 'American Samoa',
    'AD' : 'Andorra',
    'AO' : 'Angola',
    'AI' : 'Anguilla',
    'AQ' : 'Antarctica',
    'AG' : 'Antigua And Barbuda',
    'AR' : 'Argentina',
    'AM' : 'Armenia',
    'AW' : 'Aruba',
    'AU' : 'Australia',
    'AT' : 'Austria',
    'AZ' : 'Azerbaijan',
    'BS' : 'Bahamas',
    'BH' : 'Bahrain',
    'BD' : 'Bangladesh',
    'BB' : 'Barbados',
    'BY' : 'Belarus',
    'BE' : 'Belgium',
    'BZ' : 'Belize',
    'BJ' : 'Benin',
    'BM' : 'Bermuda',
    'BT' : 'Bhutan',
    'BO' : 'Bolivia',
    'BA' : 'Bosnia And Herzegovina',
    'BW' : 'Botswana',
    'BV' : 'Bouvet Island',
    'BR' : 'Brazil',
    'IO' : 'British Indian Ocean Territory',
    'BN' : 'Brunei Darussalam',
    'BG' : 'Bulgaria',
    'BF' : 'Burkina Faso',
    'BI' : 'Burundi',
    'KH' : 'Cambodia',
    'CM' : 'Cameroon',
    'CA' : 'Canada',
    'CV' : 'Cape Verde',
    'KY' : 'Cayman Islands',
    'CF' : 'Central African Republic',
    'TD' : 'Chad',
    'CL' : 'Chile',
    'CN' : 'China',
    'CX' : 'Christmas Island',
    'CC' : 'Cocos (Keeling) Islands',
    'CO' : 'Colombia',
    'KM' : 'Comoros',
    'CG' : 'Congo',
    'CD' : 'Congo, Democratic Republic',
    'CK' : 'Cook Islands',
    'CR' : 'Costa Rica',
    'CI' : 'Cote D\'Ivoire',
    'HR' : 'Croatia',
    'CU' : 'Cuba',
    'CY' : 'Cyprus',
    'CZ' : 'Czech Republic',
    'DK' : 'Denmark',
    'DJ' : 'Djibouti',
    'DM' : 'Dominica',
    'DO' : 'Dominican Republic',
    'EC' : 'Ecuador',
    'EG' : 'Egypt',
    'SV' : 'El Salvador',
    'GQ' : 'Equatorial Guinea',
    'ER' : 'Eritrea',
    'EE' : 'Estonia',
    'ET' : 'Ethiopia',
    'FK' : 'Falkland Islands (Malvinas)',
    'FO' : 'Faroe Islands',
    'FJ' : 'Fiji',
    'FI' : 'Finland',
    'FR' : 'France',
    'GF' : 'French Guiana',
    'PF' : 'French Polynesia',
    'TF' : 'French Southern Territories',
    'GA' : 'Gabon',
    'GM' : 'Gambia',
    'GE' : 'Georgia',
    'DE' : 'Germany',
    'GH' : 'Ghana',
    'GI' : 'Gibraltar',
    'GR' : 'Greece',
    'GL' : 'Greenland',
    'GD' : 'Grenada',
    'GP' : 'Guadeloupe',
    'GU' : 'Guam',
    'GT' : 'Guatemala',
    'GG' : 'Guernsey',
    'GN' : 'Guinea',
    'GW' : 'Guinea-Bissau',
    'GY' : 'Guyana',
    'HT' : 'Haiti',
    'HM' : 'Heard Island & Mcdonald Islands',
    'VA' : 'Holy See (Vatican City State)',
    'HN' : 'Honduras',
    'HK' : 'Hong Kong',
    'HU' : 'Hungary',
    'IS' : 'Iceland',
    'IN' : 'India',
    'ID' : 'Indonesia',
    'IR' : 'Iran, Islamic Republic Of',
    'IQ' : 'Iraq',
    'IE' : 'Ireland',
    'IM' : 'Isle Of Man',
    'IL' : 'Israel',
    'IT' : 'Italy',
    'JM' : 'Jamaica',
    'JP' : 'Japan',
    'JE' : 'Jersey',
    'JO' : 'Jordan',
    'KZ' : 'Kazakhstan',
    'KE' : 'Kenya',
    'KI' : 'Kiribati',
    'KR' : 'Korea',
    'KW' : 'Kuwait',
    'KG' : 'Kyrgyzstan',
    'LA' : 'Lao People\'s Democratic Republic',
    'LV' : 'Latvia',
    'LB' : 'Lebanon',
    'LS' : 'Lesotho',
    'LR' : 'Liberia',
    'LY' : 'Libyan Arab Jamahiriya',
    'LI' : 'Liechtenstein',
    'LT' : 'Lithuania',
    'LU' : 'Luxembourg',
    'MO' : 'Macao',
    'MK' : 'Macedonia',
    'MG' : 'Madagascar',
    'MW' : 'Malawi',
    'MY' : 'Malaysia',
    'MV' : 'Maldives',
    'ML' : 'Mali',
    'MT' : 'Malta',
    'MH' : 'Marshall Islands',
    'MQ' : 'Martinique',
    'MR' : 'Mauritania',
    'MU' : 'Mauritius',
    'YT' : 'Mayotte',
    'MX' : 'Mexico',
    'FM' : 'Micronesia, Federated States Of',
    'MD' : 'Moldova',
    'MC' : 'Monaco',
    'MN' : 'Mongolia',
    'ME' : 'Montenegro',
    'MS' : 'Montserrat',
    'MA' : 'Morocco',
    'MZ' : 'Mozambique',
    'MM' : 'Myanmar',
    'NA' : 'Namibia',
    'NR' : 'Nauru',
    'NP' : 'Nepal',
    'NL' : 'Netherlands',
    'AN' : 'Netherlands Antilles',
    'NC' : 'New Caledonia',
    'NZ' : 'New Zealand',
    'NI' : 'Nicaragua',
    'NE' : 'Niger',
    'NG' : 'Nigeria',
    'NU' : 'Niue',
    'NF' : 'Norfolk Island',
    'MP' : 'Northern Mariana Islands',
    'NO' : 'Norway',
    'OM' : 'Oman',
    'PK' : 'Pakistan',
    'PW' : 'Palau',
    'PS' : 'Palestinian Territory, Occupied',
    'PA' : 'Panama',
    'PG' : 'Papua New Guinea',
    'PY' : 'Paraguay',
    'PE' : 'Peru',
    'PH' : 'Philippines',
    'PN' : 'Pitcairn',
    'PL' : 'Poland',
    'PT' : 'Portugal',
    'PR' : 'Puerto Rico',
    'QA' : 'Qatar',
    'RE' : 'Reunion',
    'RO' : 'Romania',
    'RU' : 'Russian Federation',
    'RW' : 'Rwanda',
    'BL' : 'Saint Barthelemy',
    'SH' : 'Saint Helena',
    'KN' : 'Saint Kitts And Nevis',
    'LC' : 'Saint Lucia',
    'MF' : 'Saint Martin',
    'PM' : 'Saint Pierre And Miquelon',
    'VC' : 'Saint Vincent And Grenadines',
    'WS' : 'Samoa',
    'SM' : 'San Marino',
    'ST' : 'Sao Tome And Principe',
    'SA' : 'Saudi Arabia',
    'SN' : 'Senegal',
    'RS' : 'Serbia',
    'SC' : 'Seychelles',
    'SL' : 'Sierra Leone',
    'SG' : 'Singapore',
    'SK' : 'Slovakia',
    'SI' : 'Slovenia',
    'SB' : 'Solomon Islands',
    'SO' : 'Somalia',
    'ZA' : 'South Africa',
    'GS' : 'South Georgia And Sandwich Isl.',
    'ES' : 'Spain',
    'LK' : 'Sri Lanka',
    'SD' : 'Sudan',
    'SR' : 'Suriname',
    'SJ' : 'Svalbard And Jan Mayen',
    'SZ' : 'Swaziland',
    'SE' : 'Sweden',
    'CH' : 'Switzerland',
    'SY' : 'Syrian Arab Republic',
    'TW' : 'Taiwan',
    'TJ' : 'Tajikistan',
    'TZ' : 'Tanzania',
    'TH' : 'Thailand',
    'TL' : 'Timor-Leste',
    'TG' : 'Togo',
    'TK' : 'Tokelau',
    'TO' : 'Tonga',
    'TT' : 'Trinidad And Tobago',
    'TN' : 'Tunisia',
    'TR' : 'Turkey',
    'TM' : 'Turkmenistan',
    'TC' : 'Turks And Caicos Islands',
    'TV' : 'Tuvalu',
    'UG' : 'Uganda',
    'UA' : 'Ukraine',
    'AE' : 'United Arab Emirates',
    'GB' : 'United Kingdom',
    'US' : 'United States',
    'UM' : 'United States Outlying Islands',
    'UY' : 'Uruguay',
    'UZ' : 'Uzbekistan',
    'VU' : 'Vanuatu',
    'VE' : 'Venezuela',
    'VN' : 'Viet Nam',
    'VG' : 'Virgin Islands, British',
    'VI' : 'Virgin Islands, U.S.',
    'WF' : 'Wallis And Futuna',
    'EH' : 'Western Sahara',
    'YE' : 'Yemen',
    'ZM' : 'Zambia',
    'ZW' : 'Zimbabwe'
};
