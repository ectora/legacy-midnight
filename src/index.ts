import { ExecutorServer } from "./structures/utils/Service";
import { DatabaseGateway } from "./structures/db";

import { ConfigManager } from "./structures/utils/Config";
import BootService from "./structures/utils/Boot";

export default new ExecutorServer()
	.register(new BootService())
	.register(new DatabaseGateway({
		host: ConfigManager.DBGATE.HOST, port: ConfigManager.DBGATE.PORT,
		authentication: ConfigManager.DBGATE.AUTHKEY
	}))
	.start(1000);

console.log(process.cwd());