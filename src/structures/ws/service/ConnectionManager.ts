import { Db } from "../../db";
import { WebSocket } from "ws";
import { GatewayService } from "..";
import { IncomingMessage } from "http";
import { Clock } from "../../utils/Clock";
import { ServiceConnection } from "./ServiceConnection";

export type ConnectionData = {
	ws: WebSocket,
	connectionInfo: IncomingMessage
}

export class ConnectionManager {
	private readonly store: Record<string, ServiceConnection> = {};
	private service: GatewayService;

	constructor(service: GatewayService) {
		this.service = service;
	}

	getDatabase(): Db {
		return this.service.database;
	}

	getConnectionStore() {
		return this.store;
	}

	create(clock: Clock, connect: ConnectionData): ServiceConnection {
		const { connectionInfo, ws } = connect;
		const connectionIdentifier = `${connectionInfo.socket.remoteAddress}:${connectionInfo.socket.remotePort}`;
		const connection = this.store[connectionIdentifier];

		if (!connection) {
			const newConnection = new ServiceConnection(this, connect);
			this.store[connectionIdentifier] = newConnection;
			return newConnection;
		}
	}

	destroy(socket: import("net").Socket) {
		delete this.store[`${socket.remoteAddress}:${socket.remotePort}`];
	}
}