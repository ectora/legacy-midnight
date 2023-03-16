import { KcpServer } from ".";
import Utils from "../utils/Utils";

export class KcpConnectionEncryptor {
	private key;

	constructor(readonly server: KcpServer) {
		this.key = Utils.binaries.dispatchKey;
	}

	cipher(buffer: Buffer) {
		Utils.xorBuffer(this.key, buffer);
	}

	seed(seed: bigint) {
		const mt = this.server.sharedMt;

		mt.seed(seed);
		mt.seed(mt.next());
		mt.next();

		this.key = Buffer.allocUnsafe(0x1000);

		for (let i = 0; i < 0x1000; i += 8) {
			this.key.writeBigUInt64BE(mt.next(), i);
		}
	}
}