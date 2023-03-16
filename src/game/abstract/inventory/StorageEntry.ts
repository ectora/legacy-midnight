import { ResourceFactory } from "../../factory/ResourceFactory";
import { Item } from "bazal";

export class StorageEntry {
	private guid: bigint = BigInt(0);
	private ownerId: number = 0;
	private baseItem: Item;

	constructor(item: Item) {
		this.guid = item.guid;
		this.baseItem = item;
	}

	public setGuid(guid: bigint) {
		this.guid = guid;
	}

	public setOwnerId(ownerId: number) {
		this.ownerId = ownerId;
	}

	public getGuid() {
		return this.guid;
	}

	public getOwnerId() {
		return this.ownerId;
	}

	public getCount() {
		return this.baseItem.detail.oneofKind === "equip" ? 1 : 
			this.baseItem.detail.oneofKind === "furniture" ? this.baseItem.detail.furniture.count :
			this.baseItem.detail.oneofKind === "material" ? this.baseItem.detail.material.count : 0;
	}

	public increaseCount(count: number = 1) {
		const itemDetail = this.baseItem.detail;

		if (itemDetail.oneofKind === "material" && itemDetail.material) {
			itemDetail.material.count += count;
			this.baseItem.detail = itemDetail;
			return true;
		}

		if (itemDetail.oneofKind === "furniture" && itemDetail.furniture) {
			itemDetail.furniture.count += count;
			this.baseItem.detail = itemDetail;
			return true;
		}

		// If it's a weapon, exclude it from the list as it's unstackable.
		return false;
	}

	public decreaseCount(count: number = 1) {
		const itemDetail = this.baseItem.detail;

		if (itemDetail.oneofKind === "material" && itemDetail.material) {
			itemDetail.material.count -= count;
			this.baseItem.detail = itemDetail;
			return true;
		}

		if (itemDetail.oneofKind === "furniture" && itemDetail.furniture) {
			itemDetail.furniture.count -= count;
			this.baseItem.detail = itemDetail;
			return true;
		}

		// If it's a weapon, exclude it from the list as it's unstackable.
		return false;
	}

	toBase64() {
		return Buffer.from(
			Item.toBinary(this.baseItem)
		).toString("base64");
	}

	toItem() {
		return this.baseItem;
	}

	toBasicData() {
		return {
			guid: Number(this.getGuid()),
			itemData: this.toBase64()
		}
	}
	
	public static fromBase64(base64: string) {
		const parsedItemData = Item.fromBinary(Buffer.from(base64, "base64"));
		return new this(parsedItemData);
	}
}