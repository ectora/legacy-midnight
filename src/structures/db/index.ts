import { ServiceBase, Executor } from '../../structures/utils/Service';
import Config from '../../structures/utils/Config';
import { PrismaClient } from '@prisma/client';
import Logger from '../utils/Logger';

import { SessionProvider } from "./providers/SessionProvider";
import { AccountProvider } from './providers/AccountProvider';

export class Db extends ServiceBase<Executor> {
	public connected: boolean = false;
	public prisma: PrismaClient;
	public readonly config;

	public sessions: SessionProvider;
	public accounts: AccountProvider;

	constructor(config: typeof Config) {
		super();
		this.config = config;
		this.prisma = new PrismaClient();

		this.sessions = new SessionProvider(this);
		this.accounts = new AccountProvider(this);
	}

	protected async setup(_service: Executor): Promise<void> {
		try {
			await this.prisma.$connect();
			this.connected = !this.connected;
			Logger.info(`<Database>: Connection intialization is a success, connected to peer database!`);
		} catch (error) {
			Logger.warn(`<Database>: Connection initialization ran into an error: ${error}`);
		} finally {
			await this.sessions.init();
			await this.accounts.init();
		}
	}

}