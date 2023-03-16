import { InitializeConnectionReq, InitializeConnectionRsp, ServiceType } from "../service/ServiceProtocolBuffers";
import { Command } from "../ServiceCommands";

const commandObject: Command = {
      handle: (serviceWs, message) => {
            if (!serviceWs.getAuthState()) {
                  const connectionReq = InitializeConnectionReq.fromBinary(Buffer.from(message.data, "base64"));
                  if (serviceWs.getServiceType() === ServiceType.NONE) serviceWs.setServiceType(connectionReq.serviceType);

                  serviceWs.toggleAuthState();
                  serviceWs.send("InitializeConnectionRsp", InitializeConnectionRsp.toBinary({ dbgateServerTime: BigInt(Date.now()) }));
            }
      },
}

export default commandObject;