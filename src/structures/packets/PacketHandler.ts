import EventEmitter from "events";
import fs from "fs";
import path from "path";
import { Packet } from "./Packet";
import Utils from "../utils/Utils";
import Logger from "../utils/Logger";
import { PacketName } from "./PacketOpcodes";
import { ServiceBase, Executor } from "../utils/Service";
import { Session } from "../kcp/Session";
import { DataPacket } from "../kcp/DataPacket";

interface PacketHandlerCore {
	removeAllListeners(event: PacketName): this;
	emit(event: PacketName | symbol, ...args: any[]): boolean;
	on(event: PacketName, listener: (session: Session, packet: DataPacket) => void): this;
	once(event: PacketName, listener: (session: Session, packet: DataPacket) => void): this;
	off(event: PacketName, listener: (session: Session, packet: DataPacket) => void): this;
	removeListener(event: PacketName, listener: (session: Session, packet: DataPacket) => void): this;
}

class PacketHandlerCore extends EventEmitter {
	public constructor() { super(); }
}

export class PacketHandler extends ServiceBase<Executor> {
	public core: PacketHandlerCore = new PacketHandlerCore();
	public packets: Map<string, Packet> = new Map();
	public constructor() { super(); }

	public init(): void {
		const packetsPath = path.resolve(process.cwd(), "./src/game/packets");
		const packets = fs.readdirSync(packetsPath).filter(packet => packet.endsWith(".ts"));

		for (const packet of packets) {
			delete require.cache[require.resolve(path.resolve(packetsPath, packet))];
			const { name } = path.parse(path.resolve(packetsPath, packet));
			const File = require(path.resolve(packetsPath, packet));

			if (!Utils.isClass(File.default)) throw new TypeError(`Packet ${name} doesn't export a class.`);
			const pckt = new File.default(this);
			if (!(pckt instanceof Packet)) throw new TypeError(`The packet ${name} isn't an instance of Packet.`);

			this.packets.set(pckt.name, pckt);
			// @ts-ignore: Argument of type 'string' is not assignable to parameter of type PacketName
			this.core.on(pckt.name, (...args: any[]) => {
				// @ts-ignore: A spread argument must either have a tuple type or be passed to a rest parameter.
				pckt.onRun(...args);
			});
		}

		Logger.verbose2(`<PacketHandler>: Registered ${this.packets.size} in-game packets.`);
	}

	protected setup(service: Executor): void {}
}