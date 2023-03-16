import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import Utils from "../../structures/utils/Utils";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity({ schema: "sessions", tableName: "sessions" })
export class SessionEntity {

	@PrimaryKey()
	_id!: ObjectId;

	@SerializedPrimaryKey()
	id!: string;

	@Property()
	endpoint!: string;

	@Property()
	device_id!: string;

	@Property({ default: Date.now() +  (26298 * 1e5) })
	time_to_live!: number;

	@Property({ default: Utils.createSessionKey(32) })
	session_key!: string;

	@Property()
	for_uid!: string;

}