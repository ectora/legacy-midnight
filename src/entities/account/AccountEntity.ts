import { Entity, Enum, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import Utils from "../../structures/utils/Utils";

export enum PermissionRole {
	USER = "USER",
	STAFF = "STAFF",
	ADMIN = "ADMIN"
}

@Entity({ schema: "accounts", tableName: "accounts" })
export class AccountEntity {

	@PrimaryKey()
	_id!: ObjectId;

	@SerializedPrimaryKey()
	id!: string;

	@Property()
	uid!: string;

	@Property()
	username!: string;

	@Property({ default: Utils.createSessionKey(32) })
	unique_token!: string;
	
	@Enum({ default: PermissionRole.USER })
	permission!: PermissionRole; // string enum

	constructor(uid: string, username: string) {
		this.uid = uid;
		this.username = username;
	}

}