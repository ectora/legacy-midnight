import { HttpHandler, HttpRequest, HttpResponse, HttpsServer } from "../";
import Config from '../../../structures/utils/Config';
import Logger from "../../utils/Logger";
import Utils from "../../utils/Utils";
import { Db } from "../../db";

import { Session } from "@prisma/client";

export class AccountAPIHandler extends HttpHandler {
	readonly database;

	constructor(readonly config: typeof Config, database: Db) {
		super();
		this.database = database;
	}

	protected setup(server: HttpsServer): void {
		server.http
			.all('/account/risky/api/check', this.riskyCheck.bind(this))
			.all('/hk4e_global/mdk/shield/api/login', this.apiLogin.bind(this))
			.all('/hk4e_global/mdk/shield/api/verify', this.sessionVerify.bind(this))
			.all('/hk4e_global/combo/granter/login/v2/login', this.apiLoginV2.bind(this))
			.get('/hk4e_global/mdk/agreement/api/getAgreementInfos', this.agreementInfos.bind(this))
			.all('/hk4e_global/combo/granter/api/compareProtocolVersion', this.compareProtocolVersion.bind(this));
	}

	// https://hk4e-sdk-os.hoyoverse.com/hk4e_global/mdk/agreement/api/getAgreementInfos
	async agreementInfos(req: HttpRequest<{ Querystring: Record<string, string> }>, res: HttpResponse) {
		const paramsRet = { "data": null, "message": "Params Error", "retcode": -102 };

		if (!req.query.biz_key || !req.query.country_code || !req.query.token || !req.query.uid) return res.send(paramsRet);
		else return res.send({ "retcode": 0, "message": "OK", "data": {"marketing_agreements": [] } });
	}

	// https://api-account-os.hoyoverse.com/account/risky/api/check
	async riskyCheck(req: HttpRequest, res: HttpResponse) {
		/**
		 * @type {'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS'}
		 */
		const METHOD = req.method;
		const methodRet = { "data": null, "message": "invalid request", "retcode": 400 };

		if (METHOD !== 'POST') return res.send(methodRet);
		// console.log(req.body);

		const ret = {
			"retcode": 0,
			"message": "OK",
			"data": {
				"id": "none",
				"action": "ACTION_NONE",
				"geetest": null
			}
		};

		return res.send(ret);
	}

	// https://hk4e-sdk-os.hoyoverse.com/hk4e_global/combo/granter/api/compareProtocolVersion?
	async compareProtocolVersion(req: HttpRequest<{ Body: Record<string, string> }>, res: HttpResponse) {
		/**
		 * @type {'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS'}
		 */
		const METHOD = req.method;
		const methodRet = { "data": null, "message": "协议加载失败", "retcode": -106 };
		if (METHOD !== 'POST') return res.send(methodRet);

		return res.send({
			"retcode": 0,
			"message": "OK",
			"data": {
				"modified": true, "protocol": {
					"id": 0,
					"app_id": req.body.app_id,
					"language": "en",
					"user_proto": "",
					"priv_proto": "",
					"major": 10,
					"minimum": 0,
					"create_time": "0",
					"teenager_proto": "",
					"third_proto": ""
				}
			}
		});
	}

	// https://hk4e-sdk-os.hoyoverse.com/hk4e_global/mdk/shield/api/verify?
	async sessionVerify(req: HttpRequest<{ Body: Record<string, string> }>, res: HttpResponse) {
		/**
		 * @type {'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS'}
		 */
		const METHOD = req.method;
		const methodRet = { "data": null, "message": "参数错误", "retcode": -103 };

		if (METHOD !== 'POST') return res.send(methodRet);

		if (!req.body.token || !req.body.uid) {
			return res.send({ "retcode": -210, "data": null, "message": "Parameter error" });
		}

		const account = await this.database.prisma.account.findUnique({
			select: { uid: true, username: true, unique_token: true },
			where: { uid: req.body.uid }
		});
		
		if (!account) return res.send({ "retcode": -210, "data": null, "message": "Account does not exist." });

		const session = await this.database.prisma.session.findUnique({
			select: {
				id: true, endpoint: true,
				device_id: true, time_to_live: true,
				session_key: true, for_uid: true
			},
			where: { session_key: req.body.token }
		});
	
		if (!session) {
			// Log so anyone knows
			Logger.error(`AccountAPIHandler: ${
				account ? account.username : "A user"
			} from ${req.ip} had their session revoked due to their session key being invalid.`);

			return res.send({ "retcode": -210, "data": null, "message": "For safety purposes. Log in again." });
		}

		if (Date.now() > Number(session.time_to_live)) {
			await this.database.prisma.session.delete({
				select: {
					id: true,
					endpoint: true,
					device_id: true,
					time_to_live: true,
					session_key: true,
					for_uid: true
				},
				where: { session_key: req.body.token }
			});

			// Log so anyone knows what happened.
			Logger.error(`AccountAPIHandler: ${
				account.username ? account.username : "A user"
			} from ${req.ip} had their session revoked due to being out of date.`);
	
			return res.send({ "retcode": -210, "data": null, "message": "Session expired, for safety purposes. Log in again." });
		}
	
		const retdata = {
			"retcode": 0,
			"message": "OK",
			"data": {
				"account": {
					"uid": account.uid,
					"name": account.username,
					"email": "employee@prisma.lol",
					"mobile": "",
					"is_email_verify": "1",
					"realname": "",
					"identity_card": "",
					"token": req.body.token,
					"safe_mobile": "",
					"facebook_name": "",
					"google_name": "",
					"twitter_name": "",
					"game_center_name": "",
					"apple_name": "",
					"sony_name": "",
					"tap_name": "",
					"country": "PH",
					"reactivate_ticket": "",
					"area_code": "**",
					"device_grant_ticket": "",
					"steam_name": ""
				},
				"device_grant_required": false,
				"safe_moblie_required": false,
				"realperson_required": false,
				"realname_operation": "None"
			}
		};

		Logger.info(`AccountAPIHandler: ${account ? account.username : "A user"} from ${req.ip} has ran session verification and succeeded.`);
		return res.send(retdata);
	}

	// https://hk4e-sdk-os.hoyoverse.com/hk4e_global/combo/granter/login/v2/login?
	async apiLoginV2(req: HttpRequest<{ Body: Record<string, string> }>, res: HttpResponse) {
		/**
		 * @type {'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS'}
		 */
		const METHOD = req.method;
		const methodRet = { "data": null, "message": "签名错误", "retcode": -103 };

		if (METHOD !== 'POST') return res.send(methodRet);
		// {"data":"{\"uid\":\"26888530\",\"guest\":false,\"token\":\"c4c452bb2f6c94a3bf66067801c8e9b3\"}","app_id":4,"channel_id":1,"device":"1846a0994e02acbda299479b6f551b1619eecb691666460018784","sign":"649c9e7c2430d29bc9a64d9a86dafd10b849c1026aa99d3d89aa8163c99db02f"}

		const token: string = JSON.parse(req.body.data).token;
		const uid: string = JSON.parse(req.body.data).uid;
		if (!token || !uid) return res.send({ "data": null, "message": "渠道错误", "retcode": -107 });

		const account = await this.database.prisma.account.findUnique({
			select: { uid: true, username: true, unique_token: true },
			where: { uid: uid }
		});
		
		if (!account) return res.send({ "data": null, "message": "Account does not exist.", "retcode": -107 });
		Logger.info(`AccountAPIHandler: ${account.username} from ${req.ip} has concluded login granting.`);

		return res.send({
			"retcode": 0,
			"message": "OK",
			"data": {
				"combo_id": "0",
				"open_id": account.uid,
				"combo_token": token,
				"data": "{\"guest\": false}",
				"heartbeat" :false,
				"account_type": 1,
				"fatigue_remind": null
			}
		});
	}

	// https://hk4e-sdk-os.hoyoverse.com/hk4e_global/mdk/shield/api/login?
	async apiLogin(req: HttpRequest<{ Body: Record<string, string> }>, res: HttpResponse) {
		/**
		 * @type {'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS'}
		 */
		const METHOD = req.method;
		const methodRet = { "data": null, "message": "参数错误", "retcode": -103 };

		if (METHOD !== 'POST') return res.send(methodRet);
		// Logger.debug(`AccountAPIHandler: ROUTE ${req.url}`);
		if ("password" in req.body) {
			// console.log(req.body);

			try {
				const password = Buffer.from(req.body.password, 'base64');
				const decryptedPass = Utils.passDecrypt(Utils.keys.signingPem, password);
				// Logger.warn(`Passwordinator: The decrypted password is ${decryptedPass.toString()}`);
			} catch (error) {
				// Logger.error(`Passwordinator: Failed to decrypt password with private key.`);
				// @ts-ignore
				// Logger.error(error);
				return res.send({ "retcode": 12, "data": null, "message": "Invalid account format" });
			}
		}

		const account = await this.database.prisma.account.findUnique({
			select: { uid: true, username: true, unique_token: true },
			where: { username: req.body.account }
		});		

		if (!account) {
			if (!this.config.AUTO_CREATE_ACCOUNT) {
				// Log actions made so anyone aware who tried to make an account.
				Logger.error(`AccountAPIHandler: ${req.body.account} from ${req.ip} tried to create an account but failed due to set rules.`);
				return res.send({ "retcode": -210, "data": null, "message": "Account or password error." });
			}

			const uid: number = Math.floor(Math.random() * 999999999);
			const timeToLive: number = Date.now() + (6048 * 1e5);
			const endpoint = await Utils.getAreaTypeFromEndpoint(req.ip);

			const newAccount = await this.database.prisma.account.create({
				data: {
					uid: uid.toString(),
					username: req.body.account,
					unique_token: Utils.createSessionKey(32)
				}
			});

			const session = await this.database.prisma.session.create({
				data: {
					endpoint: req.ip,
					device_id: Buffer.from(req.headers["user-agent"]?.toString() || "Mozilla/5.0 (Windows; U; Windows NT 6.0) AppleWebKit/531.43.2 (KHTML, like Gecko) Version/4.0.5 Safari/531.43.2").toString('hex'),
					time_to_live: BigInt(timeToLive),
					session_key: Utils.createSessionKey(32),
					for_uid: uid.toString()
				}
			});

			// Log actions made so anyone aware who made an account.
			Logger.debug(`AccountAPIHandler: Account creation request for upstream ${req.ip} fulfilled: ${req.body.account}`);

			return res.send({
				"retcode": 0,
				"message": "OK",
				"data": {
					"account": {
						"uid": uid.toString(),
						"name": newAccount.username,
						"email": "employee@prisma.lol",
						"mobile": "",
						"is_email_verify": "1",
						"realname": "",
						"identity_card": "",
						"token": session.session_key,
						"safe_mobile": "",
						"facebook_name": "",
						"google_name": "",
						"twitter_name": "",
						"game_center_name": "",
						"apple_name": "",
						"sony_name": "",
						"tap_name": "",
						"country": endpoint.msg,
						"reactivate_ticket": "",
						"area_code": "**",
						"device_grant_ticket": "",
						"steam_name": ""
					},
					"device_grant_required": false,
					"safe_moblie_required": false,
					"realperson_required": false,
					"reactivate_required": false,
					"realname_operation": "None"
				}
			});
		} else {
			const timeToLive: number = Date.now() + (6048 * 1e5);
			const endpoint = await Utils.getAreaTypeFromEndpoint(req.ip);

			const session = await this.database.prisma.session.create({
				data: {
					endpoint: req.ip,
					device_id: Buffer.from(req.headers["user-agent"]?.toString() || "Mozilla/5.0 (Windows; U; Windows NT 6.0) AppleWebKit/531.43.2 (KHTML, like Gecko) Version/4.0.5 Safari/531.43.2").toString('hex'),
					time_to_live: BigInt(timeToLive),
					session_key: Utils.createSessionKey(32),
					for_uid: account.uid
				}
			});

			// Log actions made so anyone aware who logged in on an account.
			Logger.debug(`AccountAPIHandler: Account authentication request for upstream ${req.ip} fulfilled: ${req.body.account}`);

			return res.send({
				"retcode": 0,
				"message": "OK",
				"data": {
					"account": {
						"uid": account.uid,
						"name": account.username,
						"email": "employee@prisma.lol",
						"mobile": "",
						"is_email_verify": "1",
						"realname": "",
						"identity_card": "",
						"token": session.session_key,
						"safe_mobile": "",
						"facebook_name": "",
						"google_name": "",
						"twitter_name": "",
						"game_center_name": "",
						"apple_name": "",
						"sony_name": "",
						"tap_name": "",
						"country": endpoint.msg,
						"reactivate_ticket": "",
						"area_code": "**",
						"device_grant_ticket": "",
						"steam_name": ""
					},
					"device_grant_required": false,
					"safe_moblie_required": false,
					"realperson_required": false,
					"reactivate_required": false,
					"realname_operation": "None"
				}
			});
		}
	}
}

