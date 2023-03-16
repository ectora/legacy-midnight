import {
	MailCollectState, MailData,
	MailItem, MailTextContent
} from "bazal";

export class Mail {
	private expirationTime: number;
	private mailData: MailData;

	constructor(mail: MailData) {
		this.mailData = mail;
		this.expirationTime = this.mailData.expireTime || 0;
	}

	addMailItem(item: MailItem) {
		return this.mailData.itemList.push(item);
	}

	getConfigId() {
		return this.mailData.configId;
	}

	getMailId() {
		return this.mailData.mailId;
	}

	getMailItem() {
		return this.mailData.itemList;
	}

	setMailId(id: number) {
		this.mailData.mailId = id;
	}

	setMailTitle(title: string) {
		if (!this.mailData.mailTextContent) {
			this.mailData.mailTextContent = MailTextContent.create({});
		}
		this.mailData.mailTextContent.title = title;
	}

	setMailContent(content: string) {
		if (!this.mailData.mailTextContent) {
			this.mailData.mailTextContent = MailTextContent.create({});
		}
		this.mailData.mailTextContent.content = content;
	}

	setMailSender(sender: string) {
		if (!this.mailData.mailTextContent) {
			this.mailData.mailTextContent = MailTextContent.create({});
		}
		this.mailData.mailTextContent.sender = sender;
	}

	setSendTime(time: number = (Date.now() / 1000)) {
		this.mailData.sendTime = Math.round(time);
	}

	setExpirationTime(time: number = ((Date.now() * 1.5) / 1000)) {
		this.mailData.expireTime = Math.round(time);
	}

	setImportance(importanceType: number) {
		this.mailData.importance = importanceType;
	}

	setArgumentList(argumentList: string[]) {
		this.mailData.argumentList = argumentList;
	}

	isRead() {
		return this.mailData.isRead;
	}

	isCollected() {
		return this.mailData.isAttachmentGot;
	}

	/**
	 * To see if the gift is collectable, checks if the item list is more than zero.
	 * @returns {boolean}
	 */
	isCollectable() {
		return this.mailData.itemList.length > 0;
	}

	toBase64() {
		return Buffer.from(
			MailData.toBinary(this.mailData)
		).toString("base64");
	}

	toMailData() {
		return this.mailData;
	}

	toBasicData() {
		return {
			mailId: this.getMailId(),
			expirationTime: this.expirationTime,
			mailData: this.toBase64()
		}
	}

	toggleRead() {
		const readState = this.mailData.isRead;
		this.mailData.isRead = !readState;
		return !readState;
	}

	/**
	 * Runs a few set of conditions to see if the mail is collectable or not.
	 * Returns a boolean if the items are collected by its collect state conditions.
	 * @returns {boolean}
	 */
	collectItems() {
		const collectState = this.mailData.collectState;

		// A check to see if the mail is a birthday gift or not.
		// Perform additional operations if it is.
		if (collectState === MailCollectState.NOT_COLLECTIBLE) {
			if (this.mailData.isAttachmentGot) return false;
			this.mailData.isAttachmentGot = true;

			return true;
		} else if (collectState === MailCollectState.COLLECTIBLE_UNCOLLECTED) {
			if (this.mailData.isAttachmentGot) return false;
			this.mailData.collectState = MailCollectState.COLLECTIBLE_COLLECTED;
			this.mailData.isAttachmentGot = true;

			return true;
		} else {
			return false;
		}
	}
	
	public static fromBase64(base64: string) {
		const parsedMailData = MailData.fromBinary(Buffer.from(base64, "base64"));
		return new Mail(parsedMailData);
	}
}