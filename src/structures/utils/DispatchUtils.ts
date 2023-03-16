type RichRGB = { red: number; green: number; blue: number; opacity?: number; };

export class Utils {
	public static toHex(d: string | number): string {
		let n = parseInt(<string>d, 10);
		if (isNaN(n)) return '00';
		n = Math.max(0, Math.min(n, 255));
		return (
		    '0123456789abcdef'.charAt((n - (n % 16)) / 16) +
		    '0123456789abcdef'.charAt(n % 16)
		);
	}

	public static cutHex(h: string) {
		return h.charAt(0) == '#' ? h.substring(1, 7) : h;
	}

	public static translateRgb(rgb: RichRGB): string {
		return "#" + (
			(1 << 24) +
			Math.round(rgb.red << 16) + 
			Math.round(rgb.green << 8) +
			Math.round(rgb.blue)
		).toString(16).slice(1);
	}

	public static translateHex(hex: string): RichRGB {
		const r = parseInt(this.cutHex(hex.toLowerCase()).substring(0, 2), 16);
		const g = parseInt(this.cutHex(hex.toLowerCase()).substring(2, 4), 16);
		const b = parseInt(this.cutHex(hex.toLowerCase()).substring(4, 6), 16);
	    
		return {
			red: r,
			green: g,
			blue: b
		};
	}

	public static gradientText(text: string, startColor: RichRGB | string, stopColor: RichRGB | string): string {
		if (typeof startColor === "string" && typeof stopColor === "string") {
			let output = "";
			let r, g, b, rinc, ginc, binc, ccol;

			r = this.translateHex(startColor).red;
			g = this.translateHex(startColor).green;
			b = this.translateHex(startColor).blue;

			rinc = (this.translateHex(stopColor).red - r) / text.length;
			ginc = (this.translateHex(stopColor).green - g) / text.length;
			binc = (this.translateHex(stopColor).blue - b) / text.length;

			for (let a = 0; a < text.length; a++) {
				ccol = this.translateRgb({ red: r, green: g, blue: b });
				if (text.charAt(a) == ' ') {
					output += ' ';
				} else {
					output += '<color="' + ccol + '">' + text.charAt(a) + '</color>';
				}

				r += rinc;
				g += ginc;
				b += binc;
			}

			return output;
		}		
	}
}