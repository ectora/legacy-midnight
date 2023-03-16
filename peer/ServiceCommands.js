const {
	CommandExceptionNotify,
	GetDbGateOperationalDataRsp,
	GetSessionDataReq, GetSessionDataRsp,
	InitializeConnectionRsp, PingTransactionType,
	ServiceHeartBeatNotify, ServicePingAckReq, ServicePingAckRsp
} = require("./ServiceProtocolBuffers");

/**
 * @typedef {Object} CommandPacket
 * @property {string} query
 * @property {string} data
 */

/**
 * @typedef {Object} Command
 * @property {(ws: import("ws").WebSocket, command: CommandPacket) => void} handle
 */

/**
 * @type {{ [command: string]: Command; }}
 */
const commands = {
	"CommandExceptionNotify": {
		handle: (ws, command) => {
			const exceptionPacket = CommandExceptionNotify.fromBinary(Buffer.from(command.data, "base64"));
			console.log(`Gateway server operation error: ${exceptionPacket.message}`)
		}
	},
	"GetDbGateOperationalDataRsp": {
		handle: (ws, command) => {
			const operationPacket = GetDbGateOperationalDataRsp.fromBinary(Buffer.from(command.data, "base64"));
			console.log(operationPacket);
		}
	},
	"InitializeConnectionRsp": {
		handle: (ws, command) => {
			const verifyPacket = InitializeConnectionRsp.fromBinary(Buffer.from(command.data, "base64"));
			console.log(`Gateway connection verified, dbgate instance is healthy.`);
			console.log(`Gateway server time: ${new Date(Number(verifyPacket.dbgateServerTime))
				.toString()}`);
		}
	},
	"ServiceHeartBeatNotify": {
		handle: (ws, command) => {
			const heartbeatNotify = ServiceHeartBeatNotify.fromBinary(Buffer.from(command.data, 'base64'));
			const heartbeatAckPacket = ServicePingAckReq.create({
				transaction: {
					creationTime: heartbeatNotify.transaction.creationTime,
					acknowledgeTime: BigInt(Date.now()),
					isTransactionAcked: true
				},
				transactionType: heartbeatNotify.transactionType
			});

			ws.send(JSON.stringify({
				query: "ServicePingAckReq",
				data: Buffer.from(ServicePingAckReq.toBinary(heartbeatAckPacket)).toString("base64")
			}));
		}
	},
	"ServicePingAckRsp": {
		handle: (ws, command) => {
			const heartbeatRsp = ServicePingAckRsp.fromBinary(Buffer.from(command.data, 'base64'));
			console.log(`Heartbeat RTT packet took ${heartbeatRsp.acknowledgeMs}ms with transaction type ${PingTransactionType[heartbeatRsp.transactionType]}`);

			setTimeout(() => {
				ws.send(JSON.stringify({
					query: "GetSessionDataReq",
					data: Buffer.from(GetSessionDataReq.toBinary({ fromUid: "", sessionKey: "" })).toString("base64")
				}));
			}, 2000);
		}
	},
	"GetSessionDataRsp": {
		handle: (ws, command) => {
			const sessionRsp = GetSessionDataRsp.fromBinary(Buffer.from(command.data, 'base64'));
			console.log(sessionRsp);
		}
	}
}

module.exports = commands;