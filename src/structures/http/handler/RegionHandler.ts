import { HttpHandler, HttpRequest, HttpResponse, HttpsServer } from "../";
import Config from "../../../structures/utils/Config";
import Utils from "../../../structures/utils/Utils";
import Andesite from "@loonaps/andesite";
import Logger from "../../utils/Logger";

const { QueryCurrRegionHttpRsp, QueryRegionListHttpRsp, Retcode } = Andesite.Protobuf.Server;

export class RegionHandler extends HttpHandler {
	private ipAddress: any;

	constructor(readonly config: typeof Config) {
		super();
		Logger.debug(`<RegionHandler>: Loaded ${this.config.GAME_SERVER.SERVERS.length} game servers.`);

		(async () => {
			const data = await fetch("https://api.ipify.org?format=json").then((response) => {
				return response.json();
			});

			this.ipAddress = data.ip;
		})();
	}

	protected setup(server: HttpsServer): void {
		server.http
			.get("/query_region_list", this.queryRegionList.bind(this))
			.get("/query_security_file", this.querySecurityFile.bind(this))
			.route({
				method: "GET",
				url: "/query_cur_region/:region",
				schema: {
					params:{
						type: "object",
						properties: {
							region: { type: "string" },
						},
						required: ["region"],
					}
				},
				// @ts-ignore
				handler: (req, res) => this.currentRegion(req, res)
			})
	}

	async querySecurityFile(_req: HttpRequest, res: HttpResponse) {
		res.status(404).send();
	}

	async queryRegionList(req: HttpRequest, res: HttpResponse) {
		const URL = `${req.protocol}://${req.hostname}`;

		let customTrackerConfig: Buffer = Buffer.from("{\"sdkenv\":\"2\",\"checkdevice\":\"false\",\"loadPatch\":\"false\",\"showexception\":\"false\",\"regionConfig\":\"pm|fk|add\",\"downloadMode\":\"0\"}");
		Utils.xorData(customTrackerConfig, Utils.binaries.dispatchKey);

		const regions = this.config.GAME_SERVER.SERVERS.map(GS => {
			return {
				name: GS.OS_CODE,
				title: GS.NAME,
				type: "DEV_PUBLIC",
				dispatchUrl: `${URL}/query_cur_region/${GS.OS_CODE}`
			}
		});

		// @ts-ignore: Object is possibly "null".
		const message = QueryRegionListHttpRsp.encode({
			regionList: regions,
			clientSecretKey: Utils.binaries.dispatchSeed,
			clientCustomConfigEncrypted: customTrackerConfig,
			enableLoginPc: true
		});

		return res.send(Buffer.from(message.finish()).toString("base64"));
	}

	async currentRegion(req: HttpRequest<{ Params: Record<string, string>, Querystring: Record<string, string> }>, res: HttpResponse) {
		const URL = `${req.protocol}://${req.hostname + req.url}`;
		Logger.verbose(`${req.ip} visited ${URL}`);

		if (!req.params["region"] || !req.query["version"]) return res.send("CAESGE5vdCBGb3VuZCB2ZXJzaW9uIGNvbmZpZw==");

		const server = this.config.GAME_SERVER.SERVERS.filter(GS => GS.OS_CODE === req.params["region"]);

		if (!server || server.length < 1) return res.send("CAESGE5vdCBGb3VuZCB2ZXJzaW9uIGNvbmZpZw==");
		if (server && server.length > 1) return res.send("CAESGE5vdCBGb3VuZCB2ZXJzaW9uIGNvbmZpZw==");

		const versionCode = req.query["version"].replaceAll(/[a-zA-Z]/g, "").split(".");
		const versionMajor = parseInt(versionCode[0]);
		const versionMinor = parseInt(versionCode[1]);
		const versionFix = parseInt(versionCode[2]);

		// @ts-ignore: Object is possibly "undefined".ts(2532)
		const Host = server[0];
		const areaCode = await Utils.getAreaTypeFromEndpoint(req.ip);

		if (!req.query["dispatchSeed"]) {
			// More love for UA Patch players
			let customTrackerConfig = Buffer.from(`{"coverSwitch":[8],"perf_report_config":"http:\/\/${this.ipAddress}\/config\/verify","perf_report_record_url":"https:\/\/${this.ipAddress}\/dataUpload"}`);
			Utils.xorData(customTrackerConfig, Utils.binaries.dispatchSeed);

			const data = QueryCurrRegionHttpRsp.encode(QueryCurrRegionHttpRsp.fromPartial({
				regionInfo: { areaType: areaCode.msg, gateserverIp: Host.HOST, gateserverPort: Host.PORT, secretKey: Utils.binaries.dispatchSeed },
				clientRegionCustomConfigEncrypted: customTrackerConfig,
			}));

			const content = Utils.rsaEncrypt(Utils.keys.overseaPem, Buffer.from(data.finish())).toString('base64');
			const sign = Utils.rsaSign(Utils.keys.signingPem, Buffer.from(data.finish())).toString("base64");

			return res.send({ content, sign });
		}

		if (versionMajor >= 3 || (versionMajor == 2 && versionMinor == 7 && versionFix >= 50) || (versionMajor == 2 && versionMinor == 8)) {
			const key_id = req.query["key_id"];
			if (!key_id) throw new Error(`Key ID was not set.`);
	
			let customTrackerConfig = Buffer.from(`{"coverSwitch":[8],"perf_report_config":"http:\/\/${this.ipAddress}\/config\/verify","perf_report_record_url":"https:\/\/${this.ipAddress}\/dataUpload"}`);
			Utils.xorData(customTrackerConfig, Utils.binaries.dispatchSeed);
		
			let message = QueryCurrRegionHttpRsp.fromPartial({
				retcode: Retcode.RET_SUCC,
				msg: this.config.MAINTENANCE.ENABLED ? "Under Maintenance" : undefined,
				regionInfo: this.config.MAINTENANCE.ENABLED ? {} : {
					areaType: areaCode.msg,
					gateserverIp: Host.HOST,
					gateserverPort: Host.PORT,
					secretKey: Utils.binaries.dispatchSeed
				},
				stopServer: this.config.MAINTENANCE.ENABLED ? {
					url: this.config.MAINTENANCE.URL,
					stopBeginTime: Math.floor(Date.now() / 1000),
					stopEndTime: Math.floor(Date.now() / 1000) + (86400),
					contentMsg: "\n" + this.config.MAINTENANCE.MESSAGE
				} : {},
				clientRegionCustomConfigEncrypted: customTrackerConfig
			});

			const data = QueryCurrRegionHttpRsp.encode(message).finish();

			// @ts-ignore  |  Utils.keys.overseaPem, hmmm.
			const content = Utils.rsaEncrypt(Utils.keys.idCollection[key_id], Buffer.from(data)).toString("base64");
			const signed = Utils.rsaSign(Utils.keys.signingPem, Buffer.from(data)).toString("base64");

			return res.send({
				content: content,
				sign: signed
			});
		}
	}
}