import { Session, Account } from "@prisma/client";
import Logger from "../../utils/Logger";
import { Db } from "..";

export class SessionProvider {
      private items = new Map<string, Session>();

      constructor(private db: Db) {}

      public async init() {
            if (!this.db.connected) throw new TypeError(`Internal database hasn't initialized connection to database.`);

            await this.db.prisma.session.findMany().then(sessions => {
                  for (const session of sessions) this.items.set(session.session_key, session);
                  Logger.debug(`<Database(SessionProvider)>: Finished mapping Prisma documents.`);
            }).catch((reason) => {
                  Logger.error(`<Database(SessionProvider)>: An error occured while mapping Prisma documents. ${reason.msg}`);
                  throw new TypeError(reason);
            });
      }

      public get(sessionKey: string): Session | null {
            if (typeof sessionKey !== "string" || typeof sessionKey === 'undefined') throw new TypeError(`SessionProvider#get: Invalid session key, must be a type of string.`);
            const item = this.items.get(sessionKey);

            return item;
      }

      public set(session: Session): boolean {
            const item = this.items.get(session.session_key);

            if (!item) {
                  // Add the latest cached data after deleting cache.
                  this.items.set(session.session_key, session);

                  // Create new data.
                  if (!session.id || session.id.length < 1) session.id = null;
                  this.db.prisma.session.create({
                        data: {...session}
                  });

                  return true;
            } else {
                  // Delete the old cached data.
                  this.items.delete(session.session_key);
                  // Add the latest cached data after deleting cache.
                  this.items.set(item.session_key, session);

                  // Update old data to new data.
                  if (!session.id || session.id.length < 1) session.id = null;
                  this.db.prisma.session.update({
                        where: {...item},
                        data: {...session}
                  });

                  return true;
            }
      }

      public delete(sessionKey: string): boolean {
            if (typeof sessionKey !== "string" || typeof sessionKey === 'undefined') throw new TypeError(`SessionProvider#delete: Invalid session key, must be a type of string.`);
            const item = this.items.get(sessionKey);
            if (!item) return false;

            // Map out select query for Prisma specific document.
            const sessionSelectQuery: { [key: string]: boolean } = {};
            Object.keys({ ...item }).map((key) => { sessionSelectQuery[key] = true; });

            // Delete the cached data.
            this.items.delete(item.session_key);
            // Delete data in database.
            this.db.prisma.session.delete({
                  select: sessionSelectQuery,
                  where: { session_key: sessionKey }
            });

            return true;
      }

      public toArray(): Session[] {
            return Array.from(this.items.values());
      }

      public toMap(): Map<string, Session> {
            return this.items;
      }

      public toMappedObject(): { [key: string]: Session } {
            const keys = Array.from(this.items.keys());
            const values = Array.from(this.items.values());
            const mappedObjectData: { [key: string]: Session } = {};

            for (let index = 0; index < keys.length; index++) {
                  const key = keys[index];
                  const value = values[index];

                  mappedObjectData[key] = value;
            }

            return mappedObjectData;
      }
}