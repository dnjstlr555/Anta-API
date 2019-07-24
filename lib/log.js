module.exports = class {
	constructor() {
		this.color = {
			Reset: "\x1b[0m",
			Bright: "\x1b[1m",
			Dim: "\x1b[2m",
			Underscore: "\x1b[4m",
			Blink: "\x1b[5m",
			Reverse: "\x1b[7m",
			Hidden: "\x1b[8m",

			FgBlack: "\x1b[30m",
			FgRed: "\x1b[31m",
			FgGreen: "\x1b[32m",
			FgYellow: "\x1b[33m",
			FgBlue: "\x1b[34m",
			FgMagenta: "\x1b[35m",
			FgCyan: "\x1b[36m",
			FgWhite: "\x1b[37m",

			BgBlack: "\x1b[40m",
			BgRed: "\x1b[41m",
			BgGreen: "\x1b[42m",
			BgYellow: "\x1b[43m",
			BgBlue: "\x1b[44m",
			BgMagenta: "\x1b[45m",
			BgCyan: "\x1b[46m",
			BgWhite: "\x1b[47m",
		};
	}
	dev(text) {
		console.log(`${this.color.BgWhite}${this.color.Bright}~ DEV ${text}${this.color.Reset}`);
	}
	error(text) {
		console.log(`${this.color.BgRed}${this.color.Bright}Ⅹ ERROR ${text}${this.color.Reset}`);
	}
	
	warn(text) {
		console.log(`${this.color.FgYellow}${this.color.Bright}※ WARN ${text}${this.color.Reset}`);
	}
	
	info(text) {
		console.log(`${this.color.Bright}${this.color.BgCyan}ⅰ info${this.color.Reset} ${text}`);
	}
	work(text) {
		console.log(`${this.color.Bright}${this.color.FgYellow}♪ Working${this.color.Reset} ${text}`);
	}
	done(text) {
		console.log(`${this.color.Bright}${this.color.FgCyan}√ done${this.color.Reset} ${text}`);
	}
	
	network(text, symbol) {
		var emoji = "…";
		if(symbol)
		{
			switch(typeof symbol)
			{
				case "string":
					emoji = symbol;
					break;
				case "number":
					switch(symbol)
					{
						case 1:
							emoji = "→"; //inbound
							break;
						case 2:
							emoji = "←"; //outbound
							break;
					}
					break;
				default:
					emoji = "…";
			}
		}
		console.log(`${this.color.Bright}${this.color.BgBlack}${emoji}${this.color.Reset}${this.color.BgBlack}${this.color.Reverse} Network${this.color.Reset} ${text}`);
	}
}
