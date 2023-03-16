import { Session } from "../kcp/Session";
import { DataPacket } from "../kcp/DataPacket";
import { PacketHandler } from "./PacketHandler";

export class Packet {
	public name;
	/** The core who instantiated the packet class. Usually holds the Session class to get access to packet sending. */
	public core: PacketHandler;
	private path: string = "";

	constructor(core: PacketHandler, name: string) {
		this.name = name;
		this.core = core;
	}

	/**
	 * Returns the path of where the packet file is originally placed in.
	 * @returns {string}
	 */
	getPath() {
		return this.path;
	}

	/**
	 * Applies the new path of the packet file and returns the new value.
	 * @returns {string}
	 */
	setPath(path: string) {
		this.path = path;
		return this.path;
	}

	/**
	 * Function is then used when the event is emitted.
	 * @param session 
	 * @param dataPacket 
	 */
	public onRun(session: Session, dataPacket: DataPacket, recvMs: bigint) {
		throw new Error(`Packet ${this.name} doesn't have a native run method.`);
	}
}