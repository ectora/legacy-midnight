import { Db } from "../../db";
import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import Logger from "../../utils/Logger";
import ServiceCommands from "../ServiceCommands";

import { ConnectionData, ConnectionManager } from "./ConnectionManager";
import { ServiceCommandType } from "../../../../schemas/ServiceCommandEnum";
import {
	CommandExceptionNotify, PingTransaction, PingTransactionType,
	ServiceHeartBeatNotify, ServiceType
} from "./ServiceProtocolBuffers";

export type ServiceMessage = {
	query: ServiceCommandType,
	data: string
};

export class ServiceConnection {
	public websocket: WebSocket;
	public connectionData: IncomingMessage;

	private manager: ConnectionManager;
	private authenticated: boolean = false;
	private heartbeatInterval: NodeJS.Timer;
	private serviceType: ServiceType =  ServiceType.NONE;
	private latency: number = 1;

	public pingTransactionTimeouts: Record<string, NodeJS.Timeout> = {};

	public transaction: {
		heartbeats: number; commands: number; droppedAcks: number;
		lastPing: bigint; exceptions: number;
	} = {
		heartbeats: 0, commands: 0, droppedAcks: 0,
		lastPing: BigInt(0), exceptions: 0
	};

	constructor(manager: ConnectionManager, connectionData: ConnectionData) {
		this.manager = manager;
		this.websocket = connectionData.ws;
		this.connectionData = connectionData.connectionInfo;

		this.websocket.on("message", this.onMessage.bind(this));
		this.websocket.on("close", this.onClose.bind(this));
		this.initSessionTimeout();
	}

	public getDatabase(): Db {
		return this.manager.getDatabase();
	}

	public getManager(): ConnectionManager {
		return this.manager;
	}

	public getLatency(): number {
		return this.latency;
	}

	public setLatency(latency: number): number {
		return this.latency = latency;
	}

	public getServiceType(): ServiceType {
		return this.serviceType;
	}

	public setServiceType(serviceType: ServiceType): void {
		this.serviceType = serviceType;
	}

	public getAuthState(): boolean {
		return this.authenticated;
	}

	public toggleAuthState(): void {
		this.authenticated = !this.authenticated;
	}

	private onClose(ws: WebSocket, code: number, reason: Buffer): void {
		if (this.authenticated) {
			Logger.warn(`<WebSocketService>: Connection closed from /${this.connectionData.socket.remoteAddress}:${this.connectionData.socket.remotePort}: ${code}`);
			Object.values(this.pingTransactionTimeouts).map(timeout => clearTimeout(timeout));
			clearInterval(this.heartbeatInterval);
		}

		this.manager.destroy(this.connectionData.socket);
		this.websocket.close(code, reason);
	}

	private onMessage(data: import("ws").RawData): void {
		console.log(data.toString("utf8"));

		try {
			const message = JSON.parse(data.toString("utf8")) as ServiceMessage;
			const command = ServiceCommands[message.query];

			if (!command) {
				this.send("CommandExceptionNotify", Buffer.from(CommandExceptionNotify.toBinary({
					command: message.query, isCommandInvalid: true,
					isDataMalformed: false, message: "GatewayError [INVALID_QUERY]: You have provided an invalid command query. Please see the documentation for viable queries."
				})));

				return;
			} else {
				try {
					if ([
						"ServicePingAckRsp",
						"ServicePingAckReq",
						"ServiceHeartBeatNotify"
					].includes(message.query)) {
						return command.handle(this, message);
					} else {
						this.transaction.commands += 1;
						return command.handle(this, message);
					}
				} catch (error) {
					console.error(error);
					this.send("CommandExceptionNotify", Buffer.from(CommandExceptionNotify.toBinary({
						command: message.query, isCommandInvalid: false,
						isDataMalformed: true, message: Buffer.from(error.message).toString("base64url")
					})));
				}
			}

		} catch (error) {
			// console.error(error); // May flood the console.
			this.send("CommandExceptionNotify", Buffer.from(CommandExceptionNotify.toBinary({
				command: "", isCommandInvalid: false,
				isDataMalformed: true, message: Buffer.from(error.message).toString("base64url")
			})));
		}
	}

	/**
	 * Returns a boolean if the packet is sent to the connecting service.
	 * @param responsePacket 
	 * @param data 
	 * @returns {boolean}
	 */
	public send(responsePacket: ServiceCommandType, data: any): boolean {
		try {
			if (data instanceof Uint8Array) {
				this.websocket.send(JSON.stringify({
					query: responsePacket, data: Buffer.from(data).toString("base64")
				}));
				return true;
			} else if (data instanceof Buffer) {
				this.websocket.send(JSON.stringify({
					query: responsePacket, data: data.toString("base64")
				}));
				return true;
			}

			return false;
		} catch (error) {
			return false;
		}
	}

	private initSessionTimeout(): void {
		setTimeout(() => {
			if (!this.authenticated) {
				this.connectionData.socket.destroy();
				this.manager.destroy(this.connectionData.socket);
				Logger.error(`<WebSocketService>: Connection from ${this.connectionData.socket.remoteAddress}:${this.connectionData.socket.remotePort} is halted.`);
			} else {
				Logger.info(`<WebSocketService>: Connection from ${this.connectionData.socket.remoteAddress}:${this.connectionData.socket.remotePort} is opened.`);

				// Run the ping clock every 20 seconds if the connection sent an initialize request.
				this.heartbeatInterval = setInterval(() => {
					const pingTransaction = PingTransaction.create({ creationTime: BigInt(Date.now()), acknowledgeTime: BigInt(0), isTransactionAcked: false });
					const uniqueTransaction = Buffer.from(Number(pingTransaction.creationTime).toString()).toString("base64");

					this.send("ServiceHeartBeatNotify", Buffer.from(ServiceHeartBeatNotify.toBinary({
						transaction: pingTransaction,
						transactionType: this.transaction.heartbeats < 1 ?
						PingTransactionType.FIRST_TRANSACTION :
						PingTransactionType.IS_ALIVE
					})));

					this.pingTransactionTimeouts[uniqueTransaction] = setTimeout(() => {
						// Add 1 dropped heartbeat ack if the timeout isn't cleared by sending 
						this.transaction.droppedAcks += 1;

						// Only tolerate 5 dropped heartbeat acks, then disconnect the service for inconsistent heartbeats.
						if (this.transaction.droppedAcks >= 5 && !this.connectionData.socket.destroyed) {
							this.connectionData.socket.destroy();
						}
					}, 3e4);
				}, 3e4);
			}
		}, 1050);
	}
}