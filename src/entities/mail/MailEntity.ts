import { Entity, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import Utils from "../../structures/utils/Utils";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity({ schema: "mail", tableName: "mail" })
export class MailEntity {

	@PrimaryKey()
	_id!: ObjectId;

	@SerializedPrimaryKey()
	id!: string;

	@Property()
	guid!: number;

	@Property()
	mail_data!: string;

	@Property()
	expiration_time!: bigint;

	@Property()
	is_attachment_got!: boolean;

	@Property()
	is_read!: boolean;

}