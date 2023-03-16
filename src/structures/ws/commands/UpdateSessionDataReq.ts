import { DbGateOpcodes, UpdateSessionDataReq, UpdateSessionDataRsp, Session } from "../service/ServiceProtocolBuffers";
import { ServiceConnection } from "../service/ServiceConnection";
import { Command } from "../ServiceCommands";

const commandObject: Command = {
	handle: (serviceWs, message) => {
		if (!serviceWs.getAuthState()) return serviceWs.send("UpdateSessionDataRsp", UpdateSessionDataRsp.toBinary(
			UpdateSessionDataRsp.create({ retcode: DbGateOpcodes.OP_FORBIDDEN })
		));

		const updateSessionReq = UpdateSessionDataReq.fromBinary(Buffer.from(message.data, "base64"));
		const { endpoint, deviceId, timeToLive, sessionKey, forUid } = updateSessionReq.sessionData;
		const session = serviceWs.getDatabase().sessions.get(updateSessionReq.sessionKey);

		// If the session isn't found. Run the task to create a session key.
		if (!session) return commandObject.nonexistentSession(serviceWs, {
			endpoint, deviceId, timeToLive, sessionKey, forUid
		});

		// Create a session key with peer data.
		const latestSession = serviceWs.getDatabase().sessions.set({
			id: session.id,
			endpoint: session.endpoint, device_id: session.device_id,
			time_to_live: session.time_to_live, session_key: session.session_key,
			for_uid: session.for_uid
		});

		// If it didn't make one, tell the peer to know that something's wrong.
		if (!latestSession) return serviceWs.send("UpdateSessionDataRsp", UpdateSessionDataRsp.toBinary({
			retcode: DbGateOpcodes.OP_TOKEN_ERROR
		}));

		// If it made one, tell the peer that the operation is a success.
		return serviceWs.send("UpdateSessionDataRsp", UpdateSessionDataRsp.toBinary({
			retcode: DbGateOpcodes.OP_SUCC
		}));
	},
	nonexistentSession: (serviceWs: ServiceConnection, session: Session) => {
		// Create a session key with peer data.
		const newSession = serviceWs.getDatabase().sessions.set({
			id: "",
			endpoint: session.endpoint, device_id: session.deviceId,
			time_to_live: session.timeToLive, session_key: session.sessionKey,
			for_uid: session.forUid
		});

		// If it didn't make one, tell the peer to know that something's wrong.
		if (!newSession) return serviceWs.send("UpdateSessionDataRsp", UpdateSessionDataRsp.toBinary({
			retcode: DbGateOpcodes.OP_TOKEN_ERROR
		}));

		// If it made one, tell the peer that the operation is a success.
		return serviceWs.send("UpdateSessionDataRsp", UpdateSessionDataRsp.toBinary({
			retcode: DbGateOpcodes.OP_SUCC
		}));
	}
}

export default commandObject;