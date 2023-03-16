import { Session } from "../../../structures/kcp/Session";
import { Player } from "../Player";
import mongoose from "mongoose";

import { StorageEntry } from "./StorageEntry";
export const model = mongoose.model("storage", new mongoose.Schema({
	owner_id: String,
	storageEntries: {},
	nextFieldGoingBlankIdkWhy: Boolean
}));

export class Storage {
	private schema;
	private owner: Player;
	private session: Session;
	private items: { [key: string]: StorageEntry } = {};
	public guidAliases: Map<number, number> = new Map();

	constructor(session: Session) {
		this.session = session;
		this.owner = session.getPlayer();
		this.schema = model;
	}

	public addItem(storageEntry: StorageEntry) {
		this.items[storageEntry.getGuid().toString()] = storageEntry;
		console.log(this.items);
	}

	public removeItem(id: string) {
		const itemInSet = this.items[id];
		if (!itemInSet) return false;

		delete this.items[id];
		return true;
	}

	public getItems() {
		return Array.from(Object.values(this.items));
	}

	public getItem(id: string) {
		return this.items[id];
	}

	public getOwner() {
		return this.owner;
	}

	public save() {}

	public async saveStorage() {
		let data = await this.schema.findOne({ owner_id: this.session.uid.toString() });

		const itemBase64: { [key: string]: string } = {};
		const itemGuids = Object.keys(this.items);
		const itemDatas = Object.values(this.items);

		for (let index = 0; index < itemGuids.length; index++) {
			const itemKey = itemGuids[index];
			const itemValue = itemDatas[index];
			itemBase64[itemKey] = itemValue.toBase64();
		}

		if (!data) {
			const newData = await this.schema.create({
				owner_id: this.session.uid.toString(),
				storageEntries: itemBase64
			});
			newData.save();
			return;
		} else {
			data.update({
				owner_id: this.session.uid.toString(),
				storageEntries: itemBase64
			});
			data.save();
			return;
		}
	}

	public init() {
		return (async () => {
			let data = await this.schema.findOne({ owner_id: this.session.uid.toString() });

			if (data) {
				if (data.storageEntries) {
					const storageEntries: { [key: string]: string } = data.storageEntries;
					const storageGuids = Object.keys(storageEntries);
					const storageValues = Object.values(storageEntries);

					for (let index = 0; index < storageGuids.length; index++) {
						const storageGuid = storageGuids[index];
						const reinstantiatedEntry = StorageEntry.fromBase64(storageValues[index]);
						reinstantiatedEntry.setGuid(BigInt(this.session.getWorld().getNextGuid()));
						this.guidAliases.set(parseInt(storageGuid), Number(reinstantiatedEntry.getGuid()));
					}
				}
			}

			return;
		})();
	}
}