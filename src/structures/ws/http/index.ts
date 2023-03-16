export type Path = {
	methods: Array<string>;
	handle(req: import("http").IncomingMessage, res: import("http").ServerResponse, url: URL): any;
}

const paths: {
	[path: string]: Path;
} = {
	"/": {
		methods: ["GET"],
		async handle(req, res) {
			res.writeHead(200, "OK", { "Content-Type": "text/plain" })
				.end(`dbgate HTTP Service is running. Your address is ${req.socket.remoteAddress}`);
		}
	}
}

export default paths;