const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");
const { QueryCurrRegionHttpRsp } = require("bazal");

const regionTheySaySplitEvery256thCharacter = "PHYGdZgoHzIOT+3IbyHINNYDzp3g+lQyG2LEs3Zja8WEOW25yhVTNWmmAQLhlf6FOGcIxM/UqUiYdXhFgI3p8JI5SRhlRWt59B/a5MoiEW1lwxMLjkpPy1CbheduvHuzxCnBzBNUbShHTfvV4NDXHyM4ra2bhlT0hllBVMY8v1lonFgIrmCy513Uf/rUctEoVdzIZFzyo20In1D6YURtRxtZKYRngj6GZVyRUufFXsJfLpOH3AZLxJxIzgMWbXsUw78s2G1vUINKoZK6PWIqvXeRXI9snMw85jI6xEFyuJTEzutc15VF+yGBfuUviIsgm6gPja8iL8YImWrB6mQTGw==";

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