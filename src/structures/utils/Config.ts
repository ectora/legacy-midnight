import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

interface Config {
      WEB: { AUTH_PASS: string, HOST: string, PORT: number }
}

const DEFAULT_CONFIG = {

      // Webserver configuration
      WEB: {
		AUTH_PASS: "youshallnotpass",
            HOST: "127.0.0.1",
            PORT: 18102
      }

} as Config;

type DefaultConfig = typeof DEFAULT_CONFIG;

function readFile(...args: string[]) {
	return fs.readFileSync(path.resolve(process.cwd(), ...args)).toString();
}

function readConfig(): DefaultConfig {
	let config: DefaultConfig;

	try {
		config = JSON.parse(readFile('./config.json'));
		// Check if config object.keys is the same as DEFAULT_CONFIG.keys
		const missing = Object.keys(DEFAULT_CONFIG).filter(key => !config.hasOwnProperty(key));
	
		if (missing.length > 0) {
			missing.forEach(key => {
				// @ts-ignore
				config[key] = DEFAULT_CONFIG[key];
			});
			updateConfig(config);
			console.log(`Added missing config keys: ${missing.join(', ')}`);
		}
	} catch {
		console.error("Could not read config file. Creating one for you...");
		config = DEFAULT_CONFIG;
		updateConfig(config);
	}

	return config;
}
  
function updateConfig(config: any) {
	fs.writeFileSync('./config.json', JSON.stringify(config, null, "\t"));
}

export default class {
	public static config = readConfig();

	public static WEB: {
		AUTH_PASS: string;
		HOST: string;
		PORT: number;
	} = this.config.WEB;
  
	private constructor() { }
}