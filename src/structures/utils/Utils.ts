import fs from 'fs';
import path from "path";
import * as crypto from 'crypto';

export type valueof<T> = T[keyof T];

export default class {
	public static xorBuffer(key: Buffer, buffer: Buffer) {
		for (let i = 0; i < buffer.length; i++) {
			buffer[i] ^= key[i % key.length]!;
		}
	}

	static keys = {
		overseaPem: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/OSRel.pem")),
		overseaDer: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/OSRel_Pub.der")),

		chinaPem: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/CNRel.pem")),
		chinaDer: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/CNRel_Pub.der")),

		signingPem: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/SigningKey.pem")),
		signingDer: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/SigningKey.der")),

		passwordPubPem: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/auth_public-key.pem")),
		passwordPriPem: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/auth_private-key.pem")),
		passwordPriDer: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/auth_private-key.der")),

		idCollection: {
			"2": fs.readFileSync(path.join(process.cwd(), "/src/data/keys/game_keys/2.pem")),
			"3": fs.readFileSync(path.join(process.cwd(), "/src/data/keys/game_keys/3.pem")),
			"4": fs.readFileSync(path.join(process.cwd(), "/src/data/keys/game_keys/4.pem")),
			"5": fs.readFileSync(path.join(process.cwd(), "/src/data/keys/game_keys/5.pem"))
		}
	};

	public static binaries = {
		dispatchKey: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/dispatchKey.bin")),
		dispatchSeed: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/dispatchSeed.bin")),
		secretKey: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/secretKey.bin")),
		secretKeyBuffer: fs.readFileSync(path.join(process.cwd(), "/src/data/keys/secretKeyBuffer.bin"))
	};

	/**
	 * 
	 * @param {Buffer} data 
	 * @param {Buffer} key 
	 */
	public static xorData(data: Buffer, key: Buffer) {
		for (let i = 0; i < data.length; i++) {
			data.writeUInt8(data.readUInt8(i) ^ key.readUInt8(i % key.length), i);
			//data[i] = data.readUInt8(i) ^ key.readUInt8(i % 4096);
			// data[i] = (data[i] & (~key[i % 4096])) | ((~data[i] ) & key[i % 4096])
		}
	}

	public static isClass(input: any) {
            return typeof input === 'function' &&
            typeof input.prototype === 'object' &&
            input.toString().substring(0, 5) === 'class';
      }

	public static readFile(...args: string[]) {
		return fs.readFileSync(path.resolve(process.cwd(), ...args));
	}

	public static readDirectory(...args: string[]) {
		return fs.readdirSync(path.resolve(process.cwd(), ...args)).toString();
	}

	public static abilityHash(str: string): number {
		let hash = 0;

		for (let i = 0; i < str.length; i++) {
			hash = ((str.charCodeAt(i) + 131 * hash) & 0xFFFFFFFF) >>> 0
		}

		return hash;
	}

	public static getRandomInt(min: number, max: number) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1) + min);
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
			const chunk = plaintext.subarray(i * chunkSize, (i + 1) * chunkSize)
			chunks.push(crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, chunk))
		}
	    
		return Buffer.concat(chunks);
	}

	public static rsaDecrypt(privateKey: Buffer | string, ciphertext: Buffer): Buffer {
		const chunkSize = 256;
		const chunkCount = Math.ceil(ciphertext.length / chunkSize);
		const chunks: Buffer[] = [];
	    
		for (let i = 0; i < chunkCount; i++) {
			const chunk = ciphertext.subarray(i * chunkSize, (i + 1) * chunkSize)
			chunks.push(crypto.privateDecrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, chunk))
		}
	    
		return Buffer.concat(chunks)
	}

	public static rsaSign(privateKey: Buffer | string, data: Buffer): Buffer {
		const signer = crypto.createSign('RSA-SHA256');
		signer.update(data);
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
			this.mt[i] =
				(6364136223846793005n * (this.mt[i - 1]! ^ (this.mt[i - 1]! >> 62n)) + BigInt(i)) & 0xffffffffffffffffn;
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