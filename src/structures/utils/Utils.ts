import fs from 'fs';
import path from "path";
import * as crypto from 'crypto';

export default class {

	static keys = {
		signingPem: fs.readFileSync(path.join(process.cwd(), "/resources/keys/SigningKey.pem")),
		signingDer: fs.readFileSync(path.join(process.cwd(), "/resources/keys/SigningKey.der")),

		passwordPubPem: fs.readFileSync(path.join(process.cwd(), "/resources/keys/auth_public-key.pem")),
		passwordPriPem: fs.readFileSync(path.join(process.cwd(), "/resources/keys/auth_private-key.pem")),
		passwordPriDer: fs.readFileSync(path.join(process.cwd(), "/resources/keys/auth_private-key.der")),
	};

	/**
	 *
	 * @param {Buffer} data
	 * @param {Buffer} key
	 */
	public static xor(data: Uint8Array, key: Uint8Array): void {
		try {
		    for (let i = 0; i < data.length; i++) {
			data[i] ^= key[i % key.length];
		    }
		} catch (e) {
		    // handle any exceptions here
		}
	}

	public static cloneBuffer(buffer: Buffer) {
		const other = Buffer.allocUnsafe(buffer.length);
		buffer.copy(other);
		return other;
	}

	public static createSessionKey(length: number = 32) {
		var result = '';
		while (length--){
			result += Math.floor(Math.random() * 16).toString(16);
		}

		return result;
	}

	public static rsaEncrypt(publicKey: Buffer, plaintext: Buffer): Buffer {
		const chunkSize = 256 - 11;
		const chunkCount = Math.ceil(plaintext.length / chunkSize);
		const chunks: Buffer[] = [];

		for (let i = 0; i < chunkCount; i++) {
			const chunk = plaintext.subarray(i * chunkSize, (i + 1) * chunkSize);
			chunks.push(crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, chunk));
		}

		return Buffer.concat(chunks);
	}

	public static rsaDecrypt(privateKey: Buffer | string, ciphertext: Buffer): Buffer {
		const chunkSize = 256;
		const chunkCount = Math.ceil(ciphertext.length / chunkSize);
		const chunks: Buffer[] = [];

		for (let i = 0; i < chunkCount; i++) {
			const chunk = ciphertext.subarray(i * chunkSize, (i + 1) * chunkSize);
			chunks.push(crypto.privateDecrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, chunk));
		}

		return Buffer.concat(chunks);
	}

	public static rsaSign(privateKey: Buffer | string, resources: Buffer): Buffer {
		const signer = crypto.createSign('RSA-SHA256');
		signer.update(resources);
		return signer.sign({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING });
	}
}

export class Mersenne {
	private readonly mt: bigint[];

	private mti: number;

	constructor() {
		this.mt = new Array(312).fill(0n);
		this.mti = 313;
	}

	seed(seed: bigint) {
		this.mt[0] = seed & 0xffffffffffffffffn;

		for (let i = 1; i < 312; i++) {
			const PseudoMult = 6364136223846793005n;
			const HexNotation = 0xffffffffffffffffn;
			this.mt[i] = (PseudoMult * (this.mt[i - 1]! ^ (this.mt[i - 1]! >> 62n)) + BigInt(i)) & HexNotation;
		}

		this.mti = 312;
	}

	next() {
		if (this.mti >= 312) {
			if (this.mti == 313) {
				this.seed(5489n);
			}

			for (let k = 0; k < 311; k++) {
				const y = (this.mt[k]! & 0xffffffff80000000n) | (this.mt[k + 1]! & 0x7fffffffn);

				if (k < 312 - 156) {
					this.mt[k] = this.mt[k + 156]! ^ (y >> 1n) ^ ((y & 1n) == 0n ? 0n : 0xb5026f5aa96619e9n);
				} else {
					this.mt[k] = this.mt[k + 156 - 624 + this.mt.length]! ^ (y >> 1n) ^ ((y & 1n) == 0n ? 0n : 0xb5026f5aa96619e9n);
				}
			}

			const yy = (this.mt[311]! & 0xffffffff80000000n) | (this.mt[0]! & 0x7fffffffn);

			this.mt[311] = this.mt[155]! ^ (yy >> 1n) ^ ((yy & 1n) == 0n ? 0n : 0xb5026f5aa96619e9n);
			this.mti = 0;
		}

		let x = this.mt[this.mti]!;
		this.mti += 1;

		x ^= (x >> 29n) & 0x5555555555555555n;
		x ^= (x << 17n) & 0x71d67fffeda60000n;
		x ^= (x << 37n) & 0xfff7eee000000000n;
		x ^= x >> 43n;

		return x;
	}
}