import { createSocket, RemoteInfo, SocketOptions } from "dgram";
import Logger from "../../utils/Logger";
import Denque from "denque";

export type UdpPacket = {
	buffer: Buffer;
	address: string;
	port: number;
	recvMs: bigint;
};

export class UdpServer {
	readonly socket;

	private closed = false;
	private readonly recvQueue = new Denque<UdpPacket>();

	constructor(options: SocketOptions) {
		this.socket = createSocket(options, this.handleMessage.bind(this));
		this.socket.on("error", (err) => Logger.error("UdpServer: unhandled error on udp socket"));
	}

	private handleMessage(buffer: Buffer, { address, port }: RemoteInfo) {
		if (this.closed) return;
		this.recvQueue.push({ buffer, address, port, recvMs: BigInt(Date.now()) });
	}

	async bind(host: string, port: number) {
		if (this.closed) Logger.error("UdpServer: cannot rebind closed udp socket");
		await new Promise<void>((res) => this.socket.bind({ port, address: host }, res));
	}

	async close() {
		this.closed = true;
		await new Promise<void>((res) => this.socket.close(res));
		Logger.info("UdpServer: Closed UDP Connection!");
	}

	send(packet: UdpPacket) {
		if (this.closed) return;
		const { buffer, port, address } = packet;
		this.socket.send(buffer, port, address);
	}

	recv() {
		if (this.closed) return;
		return this.recvQueue.shift();
	}

	*[Symbol.iterator]() {
		let packet;
		while ((packet = this.recv())) {
			yield packet;
		}
	}
}