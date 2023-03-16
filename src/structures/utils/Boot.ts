import gradientString from 'gradient-string';
import { version, dependencies, devDependencies } from '../../../package.json';

export default {
	init: () => {
		// @ts-ignore
		console.log(gradientString('#8f99ff', '#5865f2').multiline(`
██████╗ ██████╗  ██████╗  █████╗ ████████╗███████╗
██╔══██╗██╔══██╗██╔════╝ ██╔══██╗╚══██╔══╝██╔════╝
██║  ██║██████╔╝██║  ███╗███████║   ██║   █████╗  
██║  ██║██╔══██╗██║   ██║██╔══██║   ██║   ██╔══╝  
██████╔╝██████╔╝╚██████╔╝██║  ██║   ██║   ███████╗
╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝
Running dbgate version ${version}.
	- Websocket Version: ${dependencies.ws.replace("^", "")}
	- Logger Version: ${dependencies['gradient-string'].replace("^", "")}
	- Dependencies Installed (${Object.keys(dependencies).length}): ${Object.keys(dependencies).join(', ')}
		`));
	}
}
