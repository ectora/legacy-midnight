import { Command, Permission } from "../../structures/commands/Command";

export default class KafkaCommand extends Command {
	constructor() {
		super("kafka", {
			args: [""],
			permissions: []
		})
	}

	run(session: any, dataPacket: any): void {
		console.log(`${this.name} command runs well.`);
	}
}