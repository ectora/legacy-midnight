import fs from 'fs';
import path from 'path';
import Logger from './Logger';

interface Config {
      DBGATE: { AUTHKEY: string, HOST: string, PORT: number }
}

const DEFAULT_CONFIG = {

      // Webserver configuration
      DBGATE: {
		HOST: "127.0.0.1", PORT: 18102,
		AUTHKEY: "youshallnotpass"
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
			Logger.info(`<ConfigManager>: Added missing config keys: ${missing.join(', ')}`);
		}
	} catch {
		Logger.error("<ConfigManager>: Could not read config file. Creating one for you...");
		config = DEFAULT_CONFIG;
		updateConfig(config);
	}

	return config;
}
  
function updateConfig(config: any) {
	fs.writeFileSync('./config.json', JSON.stringify(config, null, "\t"));
}

export class ConfigManager {
	public static config = readConfig();

	public static DBGATE: {
		AUTHKEY: string;
		HOST: string;
		PORT: number;
	} = this.config.DBGATE;
  
	private constructor() { }
}