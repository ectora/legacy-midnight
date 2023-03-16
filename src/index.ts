import { SystemExecutor } from "./structures/utils/Service";
import { GatewayService } from "./structures/ws";

import Config from "./structures/utils/Config";
import Boot from "./structures/utils/Boot";
import { Db } from "./structures/db";
Boot.init();

const DatabaseService = new Db(Config);

new SystemExecutor()
	.register(DatabaseService)
	.register(new GatewayService(Config, DatabaseService))
	.start(1000);