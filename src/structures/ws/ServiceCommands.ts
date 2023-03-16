import { ServiceConnection, ServiceMessage } from "./service/ServiceConnection";

import {
	GetDbGateOperationalDataReq, InitializeConnectionReq, ServicePingAckReq,
	GetSessionDataReq, UpdateSessionDataReq
} from "./commands";

export type Command = {
	handle(serviceWs: ServiceConnection, message: ServiceMessage): void;
	[etc: string]: any;
}

const commands: {
	[command: string]: Command;
} = {
	"GetDbGateOperationalDataReq": GetDbGateOperationalDataReq.default,
	"InitializeConnectionReq": InitializeConnectionReq.default,
	"UpdateSessionDataReq": UpdateSessionDataReq.default,
	"ServicePingAckReq": ServicePingAckReq.default,
	"GetSessionDataReq": GetSessionDataReq.default
}

export default commands;