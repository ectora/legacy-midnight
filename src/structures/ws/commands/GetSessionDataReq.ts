import { GetSessionDataRsp, DbGateOpcodes, GetSessionDataReq } from "../service/ServiceProtocolBuffers";
import { ServiceConnection } from "../service/ServiceConnection";
import { Command } from "../ServiceCommands";

const commandObject: Command = {
	handle: (serviceWs, message) => {
		if (!serviceWs.getAuthState()) return serviceWs.send("GetSessionDataRsp", GetSessionDataRsp.toBinary(
			GetSessionDataRsp.create({ retcode: DbGateOpcodes.OP_FORBIDDEN })
		));

		const sessionPacketReq = GetSessionDataReq.fromBinary(Buffer.from(message.data, "base64"));
		if (!sessionPacketReq.sessionKey && !sessionPacketReq.fromUid ||
			sessionPacketReq.sessionKey.length < 1 && sessionPacketReq.fromUid.length < 1) return serviceWs.send("GetSessionDataRsp",
			GetSessionDataRsp.toBinary(GetSessionDataRsp.create({ retcode: DbGateOpcodes.OP_TOKEN_PARAM_ERROR }))
		);

		if (sessionPacketReq.sessionKey && !sessionPacketReq.fromUid || sessionPacketReq.sessionKey && sessionPacketReq.fromUid.length < 1)return commandObject.onlyKey(serviceWs, sessionPacketReq);
		if (sessionPacketReq.sessionKey && sessionPacketReq.fromUid) return commandObject.hasKeyAndUid(serviceWs, sessionPacketReq);
	},
	hasKeyAndUid: (serviceWs: ServiceConnection, message: GetSessionDataReq) => {
		const sessionData = serviceWs.getDatabase().sessions.get(message.sessionKey);

		if (!sessionData) return serviceWs.send("GetSessionDataRsp", GetSessionDataRsp.toBinary(
			GetSessionDataRsp.create({ retcode: DbGateOpcodes.OP_TOKEN_ERROR })
		));

		if (sessionData.for_uid !== message.fromUid) return serviceWs.send("GetSessionDataRsp", GetSessionDataRsp.toBinary(
			GetSessionDataRsp.create({ retcode: DbGateOpcodes.OP_TOKEN_PARAM_ERROR })
		));

		return serviceWs.send("GetSessionDataRsp", GetSessionDataRsp.toBinary(GetSessionDataRsp.create({
			retcode: DbGateOpcodes.OP_SUCC,
			session: {
				endpoint: sessionData.endpoint, deviceId: sessionData.device_id,
				timeToLive: sessionData.time_to_live, sessionKey: sessionData.session_key,
				forUid: sessionData.for_uid
			}
		})));
	},
	onlyKey: (serviceWs: ServiceConnection, message: GetSessionDataReq) => {
		const sessionData = serviceWs.getDatabase().sessions.get(message.sessionKey);

		if (!sessionData) return serviceWs.send("GetSessionDataRsp", GetSessionDataRsp.toBinary(
			GetSessionDataRsp.create({ retcode: DbGateOpcodes.OP_TOKEN_ERROR })
		));

		return serviceWs.send("GetSessionDataRsp", GetSessionDataRsp.toBinary(GetSessionDataRsp.create({
			retcode: DbGateOpcodes.OP_SUCC,
			session: {
				endpoint: sessionData.endpoint, deviceId: sessionData.device_id,
				timeToLive: sessionData.time_to_live, sessionKey: sessionData.session_key,
				forUid: sessionData.for_uid
			}
		})));
	}
}

export default commandObject;