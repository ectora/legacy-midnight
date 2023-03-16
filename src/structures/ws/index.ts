import http from "http";
import { Db } from "../db";
import HTTPPaths from "./http";
import { WebSocketServer } from 'ws';

import Logger from '../utils/Logger';
import Config from '../../structures/utils/Config';
import { ServiceBase, Executor } from '../utils/Service';
import { ConnectionManager } from './service/ConnectionManager';

export class GatewayService extends ServiceBase<Executor> {

	public database: Db;
	public ws: WebSocketServer;
	public connections: ConnectionManager;
	public http: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

	constructor(readonly config: typeof Config, db: Db) {
            super();

		this.database = db;
            this.config = config;
		this.connections = new ConnectionManager(this);
		this.ws = new WebSocketServer({
			noServer: true,
			perMessageDeflate: {
				zlibDeflateOptions: {
					// See zlib defaults.
					chunkSize: 1024,
					memLevel: 7,
					level: 3
				},
				zlibInflateOptions: {
					chunkSize: 10 * 1024
				},
				// Other options settable:
				clientNoContextTakeover: true, // Defaults to negotiated value.
				serverNoContextTakeover: true, // Defaults to negotiated value.
				serverMaxWindowBits: 10, // Defaults to negotiated value.
				// Below options specified as default values.
				concurrencyLimit: 10, // Limits zlib concurrency for perf.
				threshold: 1024 // Size (in bytes) below which messages
				// should not be compressed if context takeover is disabled.
			}
		});
		this.http = http.createServer(this.handleHttpServer);

		this.http.on("upgrade", async (request: http.IncomingMessage, socket: import("net").Socket, head: Buffer) => this.handleWSUpgrade(request, socket, head));
      }

	protected async handleHttpServer(
		req: http.IncomingMessage,
		res: http.ServerResponse
	) {
		const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

		const path = HTTPPaths[url.pathname];
		const method = req.method?.toUpperCase() || "";

		if (path) {
			if (!path.methods.includes(method)) res.writeHead(405).end();
			else if (req.headers["range"]) res.writeHead(416).end();
			else if (req.headers["expect"]) res.writeHead(417).end();
			else await path.handle(req, res, url);
			return;
		}

		if (!res.headersSent && res.writable)
			return res.writeHead(404, "Not Found", { "Content-Type": "text/plain" }).end("Not Found");
	}

	protected async handleWSUpgrade(request: http.IncomingMessage, socket: import("net").Socket, head: Buffer) {
		this.ws.handleUpgrade(request, socket, head, (client) => {
			Logger.verbose2(`<GatewayService>: Incoming connection from /${request.socket.remoteAddress}:${request.socket.remotePort}`);

			const passwordIncorrect: boolean = (!!this.config.WEB.AUTH_PASS?.length && request.headers.authorization !== this.config.WEB.AUTH_PASS);
			if (passwordIncorrect) {
				Logger.error(`<GatewayService>: Connection from /${request.socket.remoteAddress}:${request.socket.remotePort} failed to authenticate.`)
				return socket.destroy();
			} else {
				this.ws.emit("connection", client, request);
			}
		});
	}

	protected setup(service: Executor): void {
		service.once(() => {
			this.ws.on("connection", (socket, req) => {
				this.connections.create(service.clock, { ws: socket, connectionInfo: req });
				Logger.info(`<GatewayService>: Verifying connection from /${req.socket.remoteAddress}:${req.socket.remotePort}.`);
			});

			const soCalledHost = `http://${this.config.WEB.HOST}:${this.config.WEB.PORT}`;

			this.http.listen(this.config.WEB.PORT, this.config.WEB.HOST, () => {
				Logger.verbose(`<GatewayService>: Gateway server is now running on ${soCalledHost}.`);
			});
		});

		service.end(() => {
			this.http.close();
			this.ws.close();
		});
	}

}