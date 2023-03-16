const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");
const { QueryCurrRegionHttpRsp } = require("bazal");

const regionTheySaySplitEvery256thCharacter = "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";

const methods = {
	/**
	 * @param {Buffer} publicKey  * @param {Buffer} ciphertext
	 */
	rsaEncrypt: (publicKey, plaintext) => {
		const chunkSize = 256 - 11;
		const chunkCount = Math.ceil(plaintext.length / chunkSize);
		const chunks = [];

		for (let i = 0; i < chunkCount; i++) {
			const chunk = plaintext.subarray(i * chunkSize, (i + 1) * chunkSize);
			chunks.push(crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, chunk));
		}

		return Buffer.concat(chunks);
	},
	/**
	 * @param {Buffer} privateKey  * @param {Buffer} ciphertext
	 */
	rsaDecrypt: (privateKey, ciphertext) => {
		const chunkSize = 256;
		const chunkCount = Math.ceil(ciphertext.length / chunkSize);
		const chunks = [];

		for (let i = 0; i < chunkCount; i++) {
			const chunk = ciphertext.subarray(i * chunkSize, (i + 1) * chunkSize);
			chunks.push(crypto.privateDecrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, chunk));
		}

		return Buffer.concat(chunks);
	}
}

const keys = {
	publicKey: fs.readFileSync(path.join(process.cwd(), '../giuass', 'pubkey.pem')),
	privateKey: fs.readFileSync(path.join(process.cwd(), '../giuass', 'prikey.pem')),
	privateKey5: fs.readFileSync(path.join(process.cwd(), '../certs', 'game_keys', '5.pem'))
};

(async () => {
	try {
		const decrypted = methods.rsaDecrypt(keys.privateKey5, Buffer.from(regionTheySaySplitEvery256thCharacter, "base64"));
		const hybridBrain = QueryCurrRegionHttpRsp.fromBinary(decrypted);
		console.log(hybridBrain);
	} catch (error) {
		console.log(`Couldn't encrypt data due to error: ${error.message}`);
	}
})();