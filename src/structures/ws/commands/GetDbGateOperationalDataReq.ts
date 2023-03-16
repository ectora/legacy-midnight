import { GetDbGateOperationalDataRsp, DbGateOpcodes, GetDbGateOperationalDataReq, ServiceBasicInfo } from "../service/ServiceProtocolBuffers";
import { Command } from "../ServiceCommands";
import os from "os";

const getPercent = (x: number, y: number) => {
	return (x / y) * 100;
}

const commandObject: Command = {
      handle: (serviceWs, message) => {
            if (!serviceWs.getAuthState()) return serviceWs.send("GetDbGateOperationalDataRsp", GetDbGateOperationalDataRsp.toBinary(
                  GetDbGateOperationalDataRsp.create({ retcode: DbGateOpcodes.OP_FORBIDDEN })
            ));

            const operationalReq = GetDbGateOperationalDataReq.fromBinary(Buffer.from(message.data, "base64"));
            const connectedServices = Object.values(serviceWs.getManager().getConnectionStore());
            const serviceInfos = connectedServices.map(service => {
                  return ServiceBasicInfo.create({
                        isAlive: true, serviceLatency: service.getLatency(),
                        serviceType: service.getServiceType(), lastPingTransaction: service.transaction.lastPing
                  });
            });

            // Map overall command queries from connected clients.
            const totalCommandQueries = connectedServices
                  .map(service => service.transaction.commands)
                  .reduce((acc, cur) => acc + cur, 0);

            // Map overall queries with exceptions from connected clients.
            const totalExceptionQueries = connectedServices
                  .map(service => service.transaction.exceptions)
                  .reduce((acc, cur) => acc + cur, 0);

            // Map overall command queries and heartbeats from connected clients.
            const totalSuccessQueries = connectedServices
                  .map(service => service.transaction.heartbeats)
                  .reduce((acc, cur) => acc + cur, 0) + totalCommandQueries;

            const performance_stats = {
                  mem_usage: Math.round(os.totalmem() - os.freemem()),
                  mem_usage_percentage: Math.round(getPercent((os.totalmem() - os.freemem()), os.totalmem()))
            };

            return serviceWs.send("GetDbGateOperationalDataRsp", GetDbGateOperationalDataRsp.toBinary({
                  retcode: 0,
                  dbConnected: serviceWs.getDatabase().connected,
                  connectedServiceCount: connectedServices.length,
                  serviceInfos: operationalReq.listServiceInfos ? serviceInfos : [],
                  totalQueriesPerformed: totalCommandQueries,
                  totalFailedQueries: totalExceptionQueries,
                  totalSuccQueries: totalSuccessQueries,

                  performanceStats: {
                        memoryUsage: BigInt(performance_stats.mem_usage),
                        memoryUsagePercentage: performance_stats.mem_usage_percentage,
                        dbgateUptime: BigInt(Math.round(process.uptime() * 1000)),
                        processId: process.pid,
                        processEnvironment: process.env?.NODE_ENV ? process.env?.NODE_ENV.toLowerCase() : 'production',
                        overallMemory: BigInt(os.totalmem())
                  }
            }));
      }
}

export default commandObject;