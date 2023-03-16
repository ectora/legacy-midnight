import fs from 'fs';
import path from 'path';

interface Config {
      DATABASE: { URI: string },
      KCP: { HOST: string, PORT: number }
}

const DEFAULT_CONFIG = {

      // Database configuration
      DATABASE: {
            URI: "mongodb://127.0.0.1:27017/MidnightTS"
      },

      // Game server configuration
      KCP: {
            HOST: "127.0.0.1",
            PORT: 22102
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
	public static DATABASE: {
		URI: string;
	} = this.config.DATABASE;

	public static KCP: {
		HOST: string;
		PORT: number;
	} = this.config.KCP;
  
	private constructor() { }
}