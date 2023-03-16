import { Session } from "../../../structures/kcp/Session";
import mongoose from "mongoose";
import { Mail } from "./Mail";

export const model = mongoose.model("mail", new mongoose.Schema({
	owner_id: String,
	mailCollection: [{}],
	mailNextId: Number,
	nextFieldGoingBlankIdkWhy: Boolean
}));

export class MailManager {
	private mailCollection: Map<number, Mail> = new Map();
	private mailNextId: number = 0;
	public session: Session;
	private schema;

	constructor(session: Session) {
		this.session = session;

		this.schema = model;
	}

	public getNextMailId(): number {
		return ++this.mailNextId;
	}

	public getAllMail(): Mail[] {
		return Array.from(this.mailCollection.values());
	}

	public getMail(mailId: number): Mail | undefined {
		return this.mailCollection.get(mailId);
	}

	public updateMail(mailId: number, updatedMail: Mail) {
		const mail = this.mailCollection.get(mailId);
		if (!mail) return false;

		this.mailCollection.set(mailId, updatedMail);
		return true;
	}

	public addMail(mail: Mail) {
		if (mail.getMailId() < 1) mail.setMailId(this.getNextMailId());
		this.mailCollection.set(mail.getMailId(), mail);
	}

	public async save() {
		const mails = Array.from(this.mailCollection.values());
		let data = await this.schema.findOne({ owner_id: this.session.uid.toString() });

		if (!data) {
			data = await this.schema.create({
				owner_id: this.session.uid.toString(),
				mailCollection: mails.map(mail => mail.toBasicData()),
				mailNextId: this.mailNextId
			});
			data.save();
			return;
		} else {
			data.update({
				owner_id: this.session.uid.toString(),
				mailCollection: mails.map(mail => mail.toBasicData()),
				mailNextId: this.mailNextId
			});
			data.save();
			return;
		}
	}

	public async init() {
		const data = await this.schema.findOne({ owner_id: this.session.uid.toString() });

		if (data) {
			if (!data.mailCollection) return;

			// @ts-ignore
			const mails: [
				{ mailId: number; expirationTime: number; mailData: string; }
			] = data.mailCollection;

			// @ts-ignore
			this.mailNextId = data.mailNextId ?? 0;
			mails.map(mail => {
				const mailData = Mail.fromBase64(mail.mailData)
				this.mailCollection.set(mail.mailId, mailData);
			});
		}

		return;
	}
}