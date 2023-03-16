import { CommandExceptionNotify, PingTransactionType, ServicePingAckReq, ServicePingAckRsp } from "../service/ServiceProtocolBuffers";
import { Command } from "../ServiceCommands";

const commandObject: Command = {
      handle: (serviceWs, message) => {
		if (!serviceWs.getAuthState()) return serviceWs.send("CommandExceptionNotify", CommandExceptionNotify.toBinary({
                  command: message.query, isCommandInvalid: false, isDataMalformed: false,
                  message: "GatewayError [REQUIRES_AUTHENTICATION]: You are not authenticated, please send an authentication packet."
            }));

            const ackPacketReq = ServicePingAckReq.fromBinary(Buffer.from(message.data, "base64"));
            const { creationTime, acknowledgeTime } = ackPacketReq.transaction;
            const serviceLatency = (Number(acknowledgeTime) - Number(creationTime));

            const uniqueTransaction = Buffer.from(Number(creationTime).toString()).toString("base64");
            if (serviceWs.pingTransactionTimeouts[uniqueTransaction]) {
                  // Stop the timeout as the heartbeat has been acknowledged.
                  clearTimeout(serviceWs.pingTransactionTimeouts[uniqueTransaction]);
                  // Delete the timeout record as it takes up memory without you knowing.
                  delete serviceWs.pingTransactionTimeouts[uniqueTransaction];
            }

            serviceWs.setLatency(serviceLatency);
            serviceWs.transaction.heartbeats += 1;
            serviceWs.transaction.lastPing = acknowledgeTime;
            serviceWs.send("ServicePingAckRsp", ServicePingAckRsp.toBinary({
                  acknowledgeMs: serviceLatency < 1 ? 1 : serviceLatency,
                  transactionType: PingTransactionType.TRANSACTION_SUCC
            }));
      }
}

export default commandObject;