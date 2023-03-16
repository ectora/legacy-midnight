/**
 * @package MidnightTS
 * @author MidnightTS (https://github.com/orgs/MidnightTS)
 * @license GPL-3.0
 */
import { CommandHandler } from "./structures/commands/CommandHandler";
import { PacketHandler } from "./structures/packets/PacketHandler";
import { ResourceFactory } from "./game/factory/ResourceFactory";
import { SystemExecutor } from "./structures/utils/Service";
import Config from "./structures/utils/Config";
import { KcpServer } from "./structures/kcp";
import Boot from "./structures/utils/Boot";
import { Db } from "./structures/db";

Boot.init();
ResourceFactory.init();
const Commands = new CommandHandler();
// const Packets = new PacketHandler();
Commands.init();
// Packets.init();

new SystemExecutor()
	// .register(new KcpServer(Config, Packets))
	.register(new Db(Config))
	// .register(Packets)
	.start(100);