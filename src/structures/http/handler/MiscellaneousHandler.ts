import { HttpHandler, HttpRequest, HttpResponse, HttpsServer } from "..";

export class MiscellaneousHandler extends HttpHandler {

      constructor() {
            super();
      }

      protected setup(server: HttpsServer): void {
            server.http
                  .all('/rpc/com.YonakaPS.ys_cn.dispatch/getAreaType', this.getAreaType.bind(this))
      }

      async getAreaType(req: HttpRequest, res: HttpResponse) {
		const publicIpv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/g;
		const privateIpRegex = /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/g;

		if (req.ip.match(publicIpv4Regex)) {
			if (req.ip.match(privateIpRegex)) {
				const getIpAddress = await fetch("https://api.ipify.org?format=json")
					.then((response) => response.json());

				const getSelfIpData = await fetch(`https://ipapi.com/ip_api.php?ip=${getIpAddress.ip}`)
					.then((response) => response.json());

				return res.send({ retcode: 0, msg: getSelfIpData.country_code });
			}

			const getIpData = await fetch(`https://ipapi.com/ip_api.php?ip=${req.ip}`)
				.then((response) => response.json());

			return res.send({ retcode: 0, msg: getIpData.country_code });
		} else {
			return res.send({ retcode: 0, msg: "CN" });
		}
      }

}

