import { HttpHandler, HttpRequest, HttpResponse, HttpsServer } from "../";

export class GenericHandler extends HttpHandler {

      constructor() {
            super();
      }

      protected setup(server: HttpsServer): void {
            server.http
                  .post('/data_abtest_api/config/experiment/list', this.abTesting.bind(this))
                  .get('/combo/box/api/config/sdk/combo', this.sdkCombo.bind(this))
                  .get('/hk4e_global/mdk/shield/api/loadConfig', this.loadConfig.bind(this))
                  .get('/device-fp/api/getExtList', this.getExtList.bind(this))
                  .all('/crash/dataUpload', this.crashDataUpload.bind(this))
                  .all('/sdk/dataUpload', this.dataUpload.bind(this))
                  .all('/log', this.dataUpload.bind(this))
      }

      async sdkCombo(req: HttpRequest<{ Querystring: Record<string, string> }>, res: HttpResponse) {
            const query = req.query;

            if (!query) return res.send({ "data": null, "message": "RetCode_InvalidKey", "retcode": 6 });
            if (!query.biz_key || query.biz_key !== "hk4e_global")
                  return res.send({ "data": null, "message": "RetCode_InvalidKey", "retcode": 6 });

            if (!query.client_type || query.client_type !== "3")
                  return res.send({ "data": null, "message": "RetCode_InvalidKey", "retcode": 6 });

            return res.send({
                  retcode: 0,
                  message: "OK",
                  data: {
                        vals: {
                              email_bind_remind_interval: "7",
                              network_report_config: "{ \"enable\": 1, \"status_codes\": [206], \"url_paths\": [\"dataUpload\"] }",
                              kibana_pc_config: "{ \"enable\": 1, \"level\": \"Info\",\"modules\": [\"download\"]",
                              kcp_enable: "false",
                              pay_payco_centered_host: "bill.payco.com",
                              list_price_tierv2_enable: "false",
                              email_bind_remind: "true",
                              disable_email_bind_skip: "false"
                        }
                  }
            });
      }

      async crashDataUpload(_req: HttpRequest, res: HttpResponse) {
            return res.send({ retcode: 0 });
      }

      async dataUpload(_req: HttpRequest, res: HttpResponse) {
            return res.send({ code: 0 });
      }

      async loadConfig(_req: HttpRequest, res: HttpResponse) {
            return res.send({
                  "retcode": 0,
                  "message": "OK",
                  "data": {
                        "id": 6,
                        "game_key": "hk4e_global",
                        "client": "PC",
                        "identity": "I_IDENTITY",
                        "guest": false,
                        "ignore_versions": "",
                        "scene": "S_NORMAL",
                        "name": "原神海外",
                        "disable_regist": false,
                        "enable_email_captcha": false,
                        "thirdparty":[
                              "fb",
                              "tw"
                        ],
                        "disable_mmt": false,
                        "server_guest": false,
                        "thirdparty_ignore": {},
                        "enable_ps_bind_account": false,
                        "thirdparty_login_configs": {
                              "fb": {
                                    "token_type": "TK_GAME_TOKEN",
                                    "game_token_expires_in":2592000
                              },
                              "tw": {
                                    "token_type": "TK_GAME_TOKEN",
                                    "game_token_expires_in":2592000
                              }
                        }
                  }
            });
      }

      async getExtList(_req: HttpRequest, res: HttpResponse) {
            return res.send({
                  "retcode": 0,
                  "message": "OK",
                  "data": {
                        "code": 200,
                        "msg": "ok",
                        "ext_list": [
                              "cpuName",
                              "systemName",
                              "systemType",
                              "deviceUID",
                              "gpuID",
                              "gpuName",
                              "gpuAPI",
                              "gpuVendor",
                              "gpuVersion",
                              "gpuMemory",
                              "osVersion",
                              "cpuCores",
                              "cpuFrequency",
                              "gpuVendorID",
                              "isGpuMultiTread",
                              "memorySize",
                              "screenSize",
                              "engineName",
                              "addressMAC"
                        ],
                        "pkg_list": []
                  }
            });
      }

      async abTesting(_req: HttpRequest, res: HttpResponse) {
            return res.send({
                  "retcode": 0,
                  "success": true,
                  "message": "",
                  "data": [
                        {
                              "code": 1000,
                              "type": 2,
                              "config_id": "14",
                              "period_id": "6036_99",
                              "version": "3",
                              "configs": {
                                    "cardType": "direct"
                              }
                        }
                  ]
            })
      }

}

