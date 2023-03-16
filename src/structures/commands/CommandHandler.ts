import fs from "fs";
import path from "path";
import Logger from "../utils/Logger";
import Utils from "../utils/Utils";
import { Command } from "./Command";

export class CommandHandler {
	public commands: Map<string, Command> = new Map();
	constructor() { }

	public init(): void {
		const commandsPath = path.resolve(process.cwd(), "./src/game/commands");
		const commands = fs.readdirSync(commandsPath).filter(command => command.endsWith(".ts"));

		for (const command of commands) {
			delete require.cache[require.resolve(path.resolve(commandsPath, command))];
			const { name } = path.parse(path.resolve(commandsPath, command));
			const File = require(path.resolve(commandsPath, command));

			if (!Utils.isClass(File.default)) throw new TypeError(`Command ${name} doesn't export a class.`);
			const cmd = new File.default();
			if (!(cmd instanceof Command)) throw new TypeError(`The command ${name} isn't an instance of Command.`);

			this.commands.set(cmd.name, cmd);
		}

		Logger.verbose2(`<CommandHandler>: Registered ${this.commands.size} in-game commands.`);
	}
}