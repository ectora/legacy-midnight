import { Account } from "@prisma/client";
import Logger from "../../utils/Logger";
import { Db } from "..";

export class AccountProvider {
      private items = new Map<string, Account>();

      constructor(private db: Db) {}

      public async init() {
            if (!this.db.connected) throw new TypeError(`Internal database hasn't initialized connection to database.`);

            await this.db.prisma.account.findMany().then(accounts => {
                  for (const account of accounts) this.items.set(account.username, account);
                  Logger.debug(`<Database(AccountProvider)>: Finished mapping Prisma documents.`);
            }).catch((reason) => {
                  Logger.error(`<Database(AccountProvider)>: An error occured while mapping Prisma documents. ${reason.msg}`);
                  throw new TypeError(reason);
            });
      }

      public get(username: string): Account | null {
            if (typeof username !== "string" || typeof username === 'undefined') throw new TypeError(`AccountProvider#get: Invalid username, must be a type of string.`);
            const item = this.items.get(username);

            return item;
      }

      public getFromUID(uid: string): Account | null {
            if (typeof uid !== "string" || typeof uid === 'undefined') throw new TypeError(`AccountProvider#getFromUID: Invalid UID, must be a type of string.`);
            const item = Array.from(this.items.values()).filter(account => account.uid === uid).shift();

            return item;
      }

      public set(account: Account): boolean {
            const item = this.items.get(account.username);

            if (!item) {
                  // Add the latest cached data after deleting cache.
                  this.items.set(account.username, account);

                  // Create new data.
                  this.db.prisma.account.create({
                        data: {...account}
                  });

                  return true;
            } else {
                  // Delete the old cached data.
                  this.items.delete(account.username);
                  // Add the latest cached data after deleting cache.
                  this.items.set(item.username, account);

                  // Update old data to new data.
                  this.db.prisma.account.update({
                        where: {...item},
                        data: {...account}
                  });

                  return true;
            }
      }

      public delete(username: string): boolean {
            if (typeof username !== "string" || typeof username === 'undefined') throw new TypeError(`AccountProvider#delete: Invalid username, must be a type of string.`);
            const item = this.items.get(username);
            if (!item) return false;

            // Map out select query for Prisma specific document.
            const accountSelectQuery: { [key: string]: boolean } = {};
            Object.keys({ ...item }).map((key) => { accountSelectQuery[key] = true; });

            // Delete the cached data.
            this.items.delete(item.username);
            // Delete data in database.
            this.db.prisma.account.delete({
                  select: accountSelectQuery,
                  where: { username: username }
            });

            return true;
      }

      public deleteFromUID(uid: string): boolean {
            if (typeof uid !== "string" || typeof uid === 'undefined') throw new TypeError(`AccountProvider#deleteFromUID: Invalid UID, must be a type of string.`);
            const item = Array.from(this.items.values()).filter(account => account.uid === uid).shift();;
            if (!item) return false;

            // Map out select query for Prisma specific document.
            const accountSelectQuery: { [key: string]: boolean } = {};
            Object.keys({ ...item }).map((key) => { accountSelectQuery[key] = true; });

            // Delete the cached data.
            this.items.delete(item.username);
            // Delete data in database.
            this.db.prisma.account.delete({
                  select: accountSelectQuery,
                  where: { username: item.username }
            });

            return true;
      }

      public toArray(): Account[] {
            return Array.from(this.items.values());
      }

      public toMap(): Map<string, Account> {
            return this.items;
      }

      public toMappedObject(): { [key: string]: Account } {
            const keys = Array.from(this.items.keys());
            const values = Array.from(this.items.values());
            const mappedObjectData: { [key: string]: Account } = {};

            for (let index = 0; index < keys.length; index++) {
                  const key = keys[index];
                  const value = values[index];

                  mappedObjectData[key] = value;
            }

            return mappedObjectData;
      }
}