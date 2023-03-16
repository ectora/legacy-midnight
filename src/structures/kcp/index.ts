import Logger from "../utils/Logger";
import { Mersenne } from "../utils/Utils";
import { UdpPacket, UdpServer } from "./udp";
import * as DataPacket from "./Handshakes";
import Config from "../../structures/utils/Config";
import { PacketHandler } from "../packets/PacketHandler";
import { Executor, ServiceBase } from "../utils/Service";
import { KcpConnectionManager } from "./ConnectionManager";

import * as KCP from 'kcp-ts';
let clientSequence = 10;

export class KcpServer extends ServiceBase<Executor> {

	readonly udp;
	readonly connections;
	public clientSequence;

	readonly sharedMt;
	readonly sharedBuffer;
	private packetHandler;
	private readonly configuration;

	constructor(readonly config: typeof Config, packetHandler: PacketHandler) {
		super();
		this.packetHandler = packetHandler;
		this.clientSequence = clientSequence;
		this.udp = new UdpServer({ type: "udp4" });
		this.connections = new KcpConnectionManager(this);

		this.sharedBuffer = Buffer.alloc(0x20000);
		this.sharedMt = new Mersenne();
		this.configuration = config;
	}

	protected setup(service: Executor) {
		service.once(async () => {
			const host = this.configuration.KCP.HOST;
			const port = this.configuration.KCP.PORT;

			await this.udp.bind(host, port);
			Logger.debug(`<KcpServer>: Listening on ${host}:${port}`);
		});

		service.tick(() => {
			for (const packet of this.udp) {
				try {
					const handshake = DataPacket.HandshakePacket.decode(packet.buffer);
					if (handshake) {
						this.handleHandshake(service, packet, handshake);
					} else {
						this.handleKcpPacket(service, packet);
						// Logger.debug(`KcpServer: ${packet.address} is ready to handle KCP packets. `);
					}
				} catch (err) {
					console.error(err);
					Logger.error(
						`KcpServer: unhandled error while handling packet (packet is neither handshake nor kcp???): ${packet.buffer.toString('base64')}`
					);
				}
			}
		});

		service.every(10, () => {
			this.connections.update();
		});

		service.every(6e4, async () => {
			const addresses = Array.from(await this.connections.getConnections().keys());

			for (const address of addresses) {
				const connection = await this.connections.getConnections().get(address);
				// TODO: dead connection handling
				connection?.map(async store => await store.getSession().getPlayer().getInventory().save())
			}
		});

		service.end(async () => {
			await this.udp.close();
			// const connections = Array.from(await this.connections.getConnections().values());
			// connections.map(connection => connection.getSession().notifyStopServer());
		});
	}

	private handleHandshake(
		exec: Executor,
		{ address, port }: UdpPacket,
		handshake: DataPacket.HandshakePacket
	) {
		if (handshake instanceof DataPacket.ConnectPacket) {
			Logger.debug(`KcpServer: Client ${address} connected!`);

			const connection = this.connections.create(exec.clock, address, port);
			const response = new DataPacket.EstablishPacket(connection.conv, connection.token);

			connection.sendRaw(response.encode());
		} else if (handshake instanceof DataPacket.DisconnectPacket) {
			// TODO: handle disconnect
			Logger.info(`KcpServer: Client ${address} disconnected!`);
		} else {
			Logger.warn(`KcpServer: Unexpected handshake from ${address}: ${handshake}`);
		}
	}

	private handleKcpPacket(
		exec: Executor,
		{ buffer, address, port, recvMs }: UdpPacket
	) {
		const conv = KCP.getConv(buffer);
		const token = KCP.getToken(buffer);
		const connection = this.connections.get(address, port, conv, token);
	  
		if (connection) {
			const read = connection.kcp.input(buffer);
		
			if (read === -1 || read === -2 || read === -3) {
				Logger.warn(`KcpServer: Received malformed kcp packet: ${buffer.toString('hex')}`);
				return;
			}
		
			for (const packet of connection) {
				connection.getSession().handle(packet, recvMs);
				// this.router.handle(exec, connection, packet);
			}
	    	}
	}

	getPacketHandler() {
		return this.packetHandler;
	}
}