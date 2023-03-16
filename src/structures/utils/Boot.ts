import { stripIndents } from "common-tags";
import gradientString from "gradient-string";
import { Executor, ServiceBase } from "./Service";
import { description, version } from '../../../package.json';

export default class BootService extends ServiceBase<Executor> {
	protected setup(service: Executor): void {
		const relType = version.includes('dev') ? `Development Edition (${version})` :
			version.includes('alpha') ? `Alpha Release (${version})` : 
			version.includes('beta') ? `Beta Release (${version})` :
			`Stable (${version})`;

		// @ts-ignore
		console.log(gradientString('#b1ff3b', '#ff933b').multiline(stripIndents`
		\u200b██████╗  █████╗ ████████╗███████╗███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ 
			██╔════╝ ██╔══██╗╚══██╔══╝██╔════╝██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
			██║  ███╗███████║   ██║   █████╗  ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
			██║   ██║██╔══██║   ██║   ██╔══╝  ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
			╚██████╔╝██║  ██║   ██║   ███████╗███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
		\u200b╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
			${description}
			\u200b
			?! Error and bug reporting is free! Report them at: https://github.com/LoonaPS/gateserver/issues
			-- Running gateserver version ${version} >> ${relType}
			\u200b
		`));
	}
}