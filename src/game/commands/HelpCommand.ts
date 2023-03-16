import { Command, Permission } from "../../structures/commands/Command";

export default class HelpCommand extends Command {
	constructor() {
		super("help", {
			args: [""],
			permissions: []
		})
	}

	run(session: any, dataPacket: any): void {
		console.log(`${this.name} command runs well.`);
	}
}