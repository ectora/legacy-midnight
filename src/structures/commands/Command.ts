export enum Permission {
	CORE = 1
};

type CommandOptions = {
	args: string[],
	permissions: Permission[]
};

export class Command {
	public name;
	public permissions;

	constructor(name: string, options: CommandOptions) {
		this.name = name;
		this.permissions = options.permissions ?? [];
	}

	run(session: any, dataPacket: any) {
		throw new Error(`Command ${this.name} doesn't have a run method.`);
	}
}