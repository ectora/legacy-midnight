import { KcpServer } from ".";
import { Clock } from "../utils/Clock";
import { Mersenne } from "../utils/Utils";
import { KcpConnection } from "./KcpConnection";

export class KcpConnectionManager {
      private readonly store: Map<string, KcpConnection[]> = new Map();
      private readonly rand = new Mersenne();

      constructor(readonly server: KcpServer) {
            this.rand.seed(BigInt(Date.now()));
      }

	/**
	 * Creates a connection within the client, would likely kill any connection connected within the same IP address.
	 * But would create a stress for the server, haven't tested yet but the client would likely reconnect and kill the
	 * other KCP connection in the same IP address trying to connect to the server.
	 * 
	 * @param clock 
	 * @param address 
	 * @param port 
	 * @returns {KcpConnection}
	 */
      create(clock: Clock, address: string, port: number) {
		const activeConnection = this.store.get(address);

		if (!activeConnection) {
			const id = this.rand.next();
			const conv = Number(id >> 32n);
			const token = Number(id & 0xffffffffn);
			const connection = new KcpConnection(
				this,
				clock,
				address,
				port,
				conv,
				token,
				false // Uses 0ms ping (visual btw)
			);
		
			this.store.set(address, [connection]);
			return connection;
		} else {
			const id = this.rand.next();
			const conv = Number(id >> 32n);
			const token = Number(id & 0xffffffffn);
			const connection = new KcpConnection(
				this,
				clock,
				address,
				port,
				conv,
				token,
				false // Uses 0ms ping (visual btw)
			);
		
			activeConnection.shift();
			activeConnection.push(connection);
			this.store.set(address, activeConnection);
			return connection;
		}
      }

      get(address: string, port: number, conv: number, token: number) {
		const stores = this.store.get(address);
		return stores?.find((c) => c.port === port && c.conv === conv && c.token === token);
      }

      getConnections() {
		return this.store;
      }

      update() {
		const addresses = Array.from(this.store.keys());

            for (const address of addresses) {
			const connection = this.store.get(address);
                  // TODO: dead connection handling
                  connection?.map(store => store.kcp.update(store.clock.now()))
            }
      }

      *[Symbol.iterator]() {
            for (const connections of Array.from(this.store.values())) {
			for (const connection of connections) {
                        yield connection;
                  }
            }
      }
}