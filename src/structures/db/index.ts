import { ServiceBase, Executor } from '../../structures/utils/Service';
import Config from '../utils/Config';
import Logger from '../utils/Logger';

import { TsMorphMetadataProvider } from "@mikro-orm/reflection";
import type { MongoDriver, MongoEntityManager } from '@mikro-orm/mongodb';
import { MikroORM } from '@mikro-orm/core';

export class Db extends ServiceBase<Executor> {
      private readonly config;
      public mikro: MikroORM<MongoDriver> | undefined;
      public entityManager: MongoEntityManager<MongoDriver> | undefined;;

      constructor(config: typeof Config) {
            super();
            this.config = config;
      }

      protected async setup(service: Executor): Promise<void> {
            try {
                  this.mikro = await MikroORM.init<MongoDriver>({
                        metadataProvider: TsMorphMetadataProvider,
                        entities: ["./build/entities/**/*.js"],
                        entitiesTs: ["./src/entities/**/*.ts"],
                        clientUrl: this.config.DATABASE.URI,
                        dbName: "YonakaPS",
                        ensureIndexes: true,
                        type: "mongo",
                        replicas: undefined,
                        implicitTransactions: false
                  }, true);

                  this.entityManager = this.mikro.em;
                  Logger.info(`<Database>: Connection successfully opened!`);
            } catch (error) {
                  Logger.error(`<Database>: Connection error`);
                  console.error(error);
            }
      }

}