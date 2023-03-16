const { WebSocket } = require("ws");
const ServiceCommands = require("./ServiceCommands");

/**
 * @typedef {Object} CommandPacket
 * @property {string} query
 * @property {string} data
 */

const ws = new WebSocket("ws://127.0.0.1:18102", {
	headers: { "Authorization": "youshallnotpass" }
});

const {
	InitializeConnectionReq, ServiceType
} = require("./ServiceProtocolBuffers");

ws.on("open", () => {
	console.log("Opened connection");
	ws.send(JSON.stringify({
		query: "InitializeConnectionReq",
		data: Buffer.from(InitializeConnectionReq.toBinary({
			serviceType: ServiceType.GAME, dbgateClientTime: BigInt(Date.now())
		})).toString("base64")
	}));
});

ws.on("message", (message) => {
	try {
		const messageData = Buffer.from(message).toString("utf8");
		/** @type {CommandPacket} */
		const pckt = JSON.parse(messageData);

		const query = pckt.query;
		const command = ServiceCommands[query];
		if (!command) return console.log(`No command with name ${query} exists.`);
		console.log(query);

		command.handle(ws, pckt);
	} catch (error) {
		console.log("An error occurred while parsing gateway message.", error);
	}
});

ws.on("close", (code) => console.log(`Connection closed: ${code}`));