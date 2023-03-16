import { Collection, Entity, ManyToMany, PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import Utils from "../../structures/utils/Utils";
import { ObjectId } from "@mikro-orm/mongodb";
import { MailEntity } from "./MailEntity";

@Entity({ schema: "mailstore", tableName: "mailstore" })
export class MailStoreEntity {

	@PrimaryKey()
	_id!: ObjectId;

	@SerializedPrimaryKey()
	id!: string;

	@ManyToMany(() => MailEntity, mail => mail.mail_data)
	collection = new Collection<MailEntity>(this);

	@Property()
	next_mail_guid!: string;

}