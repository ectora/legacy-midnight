import gradientString from 'gradient-string';
import { version } from '../../../package.json';

export default {
	init: () => {
		// @ts-ignore
		console.log(gradientString('#0095ff', '#03e1ff').multiline(`
██████╗ ██╗███████╗██████╗  █████╗ ████████╗ ██████╗██╗  ██╗
██╔══██╗██║██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██║  ██║ 
██║  ██║██║███████╗██████╔╝███████║   ██║   ██║     ███████║ 
██║  ██║██║╚════██║██╔═══╝ ██╔══██║   ██║   ██║     ██╔══██║ 
██████╔╝██║███████║██║     ██║  ██║   ██║   ╚██████╗██║  ██║ 
╚═════╝ ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝ 
Running Dispatch version ${version}.
		`));
	}
}