import fs from 'fs';
import path from 'path';

interface GameServer {
      /** The game server host where the game is gonna connect to (KCP server, must be a numerical IP address) */
      HOST: string,
      /** The game server port where the game is gonna connect to (KCP server, must be a numerical value) */
      PORT: number,
      /**
       * What the codename of the game server is for the dispatch service to find in the game server records.
       * 
       * ```e.g:``` https://some-orbit-dispatch.xyz/query_cur_region/OS_CODE
       */
      OS_CODE: string,
      /**
       * What the name of the game server is for the dispatch service to find in the game server records.
       */
      NAME: string
}

interface ConfigInterface {
      HTTP: { HOST: string, PORT: number },
      GAME_SERVER: { SERVERS: GameServer[] },
      MAINTENANCE: { ENABLED: boolean, MESSAGE: string, URL: string }
}

const BrandName = 'Loona';

const DEFAULT_CONFIG = {

      // HTTP server
      HTTP: {
            HOST: "127.0.0.1",
            PORT: 443
      },

      // Game server
      GAME_SERVER: {
            SERVERS: [{
                  NAME: `[3.3] ${BrandName}PS`,
                  HOST: "127.0.0.1",
                  PORT: 22102,
                  OS_CODE: "os_loona"
            }]
      },

      MAINTENANCE: {
            URL: "",
            ENABLED: false,
            MESSAGE: "The dispatch server is currently in maintenance mode. For the time being, the dispatch will not give out any game servers to connect to."
      },

      VERSION_HASH_TABLE: {
            "3.3.0": "CMTh2gUatQV7InJlbW90ZU5hbWUiOiJyZXNfdmVyc2lvbnNfZXh0ZXJuYWwiLCJtZDUiOiI0ZDUwNGNmYmZhZTkzYWMzMzlkYTE1NzQ2ZmQxNTk1YiIsImZpbGVTaXplIjo3NTk5Mzd9CnsicmVtb3RlTmFtZSI6InJlc192ZXJzaW9uc19tZWRpdW0iLCJtZDUiOiIwZDNiMmRiNDBkMWIwNGMwMjljZGQzYjkxMjgwNDA5NyIsImZpbGVTaXplIjozMTEyMTB9CnsicmVtb3RlTmFtZSI6InJlc192ZXJzaW9uc19zdHJlYW1pbmciLCJtZDUiOiJkYzUyYWU0ZjkwYTc5YjBmMWZlNzZiNjg2MzRhOWRmMiIsImZpbGVTaXplIjo3Nzk3MX0KeyJyZW1vdGVOYW1lIjoicmVsZWFzZV9yZXNfdmVyc2lvbnNfZXh0ZXJuYWwiLCJtZDUiOiI0MDliZGYxNDc1YWZhZmJiODM5MDFhNzExYmE2ZjQ3ZiIsImZpbGVTaXplIjo3NTk5Mzd9CnsicmVtb3RlTmFtZSI6InJlbGVhc2VfcmVzX3ZlcnNpb25zX21lZGl1bSIsIm1kNSI6Ijc1OWJmMGVjN2NkNDc0NmYxY2FkNGE5N2E5MTRkM2FhIiwiZmlsZVNpemUiOjMxMTIxMH0KeyJyZW1vdGVOYW1lIjoicmVsZWFzZV9yZXNfdmVyc2lvbnNfc3RyZWFtaW5nIiwibWQ1IjoiMGRlMTVjZmFjYTAwMmYzYmJmMjFmMTBkNDMyYmFhZDMiLCJmaWxlU2l6ZSI6Nzc5NzF9CnsicmVtb3RlTmFtZSI6ImJhc2VfcmV2aXNpb24iLCJtZDUiOiJjMWZmYjY0YmZhYmI1YmQ4Y2Y4OGYwYzhmNmNjYmQ2OCIsImZpbGVTaXplIjoxOX0iATAqCmE0NmFmNjVkNTEyCDMuM19saXZl"
      }

} as ConfigInterface;

type DefaultConfig = typeof DEFAULT_CONFIG;

function readFile(...args: string[]) {
      return fs.readFileSync(path.resolve(process.cwd(), ...args)).toString();
}
  
function readDirectory(...args: string[]) {
      return fs.readdirSync(path.resolve(process.cwd(), ...args)).toString();
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
      fs.writeFileSync(path.resolve(process.cwd(), './config.json'), JSON.stringify(config, null, "\t"));
}

export default class Config {
      private static config = readConfig();

      public static HTTP: { HOST: string; PORT: number } = this.config.HTTP;
      public static GAME_SERVER: { SERVERS: GameServer[] } = this.config.GAME_SERVER;
      public static MAINTENANCE: { ENABLED: boolean; MESSAGE: string; URL: string; } = this.config.MAINTENANCE;

      private constructor() { }
}
  