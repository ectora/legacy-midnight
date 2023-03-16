import { Kcp } from "kcp-ts";
import Utils from "../utils/Utils";
import { Clock } from "../utils/Clock";
import { KcpConnectionManager } from "./ConnectionManager";
import { KcpConnectionEncryptor } from "./ConnectionEncryptor";

import { Session } from "./Session";
import { DataPacket } from "./DataPacket";

export class KcpConnection {
	readonly kcp;
	readonly encryptor;
	private readonly session;

	constructor(
		readonly manager: KcpConnectionManager,
		readonly clock: Clock,
		readonly address: string,
		readonly port: number,
		readonly conv: number,
		readonly token: number,
		readonly useZeroMs: boolean
	) {
		this.kcp = new Kcp(conv, token, (buffer: Buffer) => {
			// kcp buffer must be cloned because it is reused internally
			buffer = Utils.cloneBuffer(buffer);

			this.sendRaw(buffer);
		}, false, useZeroMs);

		this.kcp.setWndSize(1024, 1024);
		this.session = new Session(this);
		this.encryptor = new KcpConnectionEncryptor(manager.server);
	}

	getSession() {
		return this.session;
	}

	get connected() {
		return !this.kcp.isDeadLink();
	}

	/** Sends the given packet. */
	send(packet: DataPacket) {
		const encrypted = packet.encode();
		this.encryptor.cipher(encrypted);
		this.kcp.send(encrypted);
	}

	/** Sends the given buffer directly on the underlying UDP "connection". */
	sendRaw(buffer: Buffer) {
		return this.manager.server.udp.send({
			buffer,
			address: this.address,
			port: this.port,
			recvMs: BigInt(Date.now())
		});
	}

	/** Receives a single packet. */
	recv() {
		for (;;) {
			const buffer = this.manager.server.sharedBuffer;
			const read = this.kcp.recv(buffer);

			switch (read) {
				case -1:
				case -2:
					// nothing in rcv_queue
					return;

				case -3:
					console.log('error', read);
			}

			const decrypted = Utils.cloneBuffer(buffer.slice(0, read));
			this.encryptor.cipher(decrypted);

			const packet = DataPacket.decode(decrypted);

			if (packet) {
				return packet;
			} else {
				continue;
			}
		}
	}

	/** Flushes all pending data in the KCP send buffer. */
	flush() {
		this.kcp.flush();
	}
	  
	*[Symbol.iterator]() {
		let packet;
		while ((packet = this.recv())) {
			yield packet;
		}
	}
}