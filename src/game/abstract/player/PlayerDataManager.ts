import mongoose from "mongoose";
import { Session } from "../../../structures/kcp/Session";
import { Birthday, MpSettingType, OnlinePlayerInfo, ProfilePicture } from "bazal";
import { GameConstants } from "../../factory/enum/GameConstants";
import { DataProperties } from "../../factory/enum/DataProperties";

export const model = mongoose.model("player", new mongoose.Schema({
	open_id: String,
	nickname: String,
	signature: String,
	profilePicture: {
		avatarId: Number,
		costumeId: Number
	},
	props: Object,
	registrationDate: String,
	nameCardId: Number,
	travelerId: Number,
	birthday: {
		month: Number, day: Number
	},
	nextFieldGoingBlankIdkWhy: Boolean
}));

export class PlayerData {
	private birthday: Birthday = Birthday.create({});
	private travellerId: number = 0;
	private profilePicture: { avatarId: number; costumeId: number; } = {
		avatarId: 0, costumeId: 0
	};

	private props: { [key: number]: number } = {};
	private nameCardId: number = 210001;
	private registerDate: number = 0;
	private signature: string = "";
	private nickName: string = "";
	public uid: number;
	private schema;

	constructor(uid: number) {
		this.schema = model;
		this.uid = uid;
	}

	public getBirthday(): Birthday {
		return this.birthday;
	}

	public getNickname(): string {
		return this.nickName;
	}

	public getSignature(): string {
		return this.signature;
	}

	public getNameCardId(): number {
		return this.nameCardId;
	}

	public getTravellerId(): number {
		return this.travellerId
	}

	public getProfilePicture(): ProfilePicture {
		return this.profilePicture;
	}

	public getRegisterDate() {
		return this.registerDate;
	}

	public getPlayerProp(): { [key: number]: number } {
		return this.props;
	}

	/**
	 * Sets the birthday for the player. Returns a boolean for whatever reasons.
	 * @param birthday
	 * @returns {boolean}
	 */
	public setBirthday(birthday: Birthday) {
		this.birthday = birthday;
		return true;
	}

	/**
	 * Sets the nickname for the player, returns false if the old nickname is the same as the nickname to be applied.
	 */
	public setNickname(nickname: string) {
		if (nickname === this.nickName) return false;
		this.nickName = nickname;
		return true;
	}

	/**
	 * Sets the signature for the player, returns false if the old signature is the same as the signature to be applied.
	 */
	public setSignature(signature: string) {
		if (signature === this.signature) return false;
		this.signature = signature;
		return true;
	}

	/**
	 * Sets the namecard for the player, returns false if the old namecard is the same as the namecard to be applied.
	 */
	public setNameCardId(nameCardId: number) {
		if (nameCardId === this.nameCardId) return false;
		this.nameCardId = nameCardId;
		return true;
	}

	/**
	 * Sets the main character for the player, returns false if the traveller ID is not in the constants (to prevent server errors).
	 */
	public setTravellerId(travellerId: number) {
		const mainCharacters: number[] = [GameConstants.MAIN_CHARACTER_FEMALE, GameConstants.MAIN_CHARACTER_MALE];
		if (mainCharacters.includes(travellerId)) {
			this.travellerId = travellerId;
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Sets the profile picture for the player.
	 */
	public setProfilePicture(profilePicture: ProfilePicture) {
		this.profilePicture.avatarId = profilePicture.avatarId;
		this.profilePicture.costumeId = profilePicture.costumeId ?? 0;
	}

	/**
	 * Sets the registration date for the player.
	 */
	public setRegisterDate(registerDate: number = Date.now()) {
		this.registerDate = registerDate;
	}

	/**
	 * Sets the registration date for the player.
	 */
	public setPlayerProp(playerProp: { [key: number]: number }) {
		this.props = playerProp;
	}

	public async saveChanges() {
		let data = await this.schema.findOne({ owner_id: this.uid.toString() });

		if (!data) {
			data = await this.schema.create({
				open_id: this.uid.toString(),
				nickname: this.nickName,
				signature: this.signature,
				profilePicture: {
					avatarId: this.profilePicture.avatarId,
					costumeId: this.profilePicture.costumeId
				},
				props: this.props,
				registrationDate: this.registerDate.toString(),
				nameCardId: this.nameCardId,
				travelerId: this.travellerId,
				birthday: { month: this.birthday.month, day: this.birthday.day }
			});
			data.save();
			return;
		} else {
			data.update({
				open_id: this.uid.toString(),
				nickname: this.nickName,
				signature: this.signature,
				profilePicture: {
					avatarId: this.profilePicture.avatarId,
					costumeId: this.profilePicture.costumeId
				},
				props: this.props,
				registrationDate: this.registerDate.toString(),
				nameCardId: this.nameCardId,
				travelerId: this.travellerId,
				birthday: { month: this.birthday.month, day: this.birthday.day }
			});
			data.save();
			return;
		}
	}

	public async loadFromSave(): Promise<boolean> {
		const data = await this.schema.findOne({ owner_id: this.uid });

		if (data) {
			if (data.nickname) this.setNickname(data.nickname);
			if (data.signature) this.setSignature(data.signature);
			if (data.profilePicture) {
				if (data.profilePicture.avatarId) {
					this.setProfilePicture({
						avatarId: data.profilePicture.avatarId,
						costumeId: data.profilePicture.costumeId ?? 0
					});
				}
			}

			if (data.props) {
				const props: { [key: string]: number } = data.props;
				const propKeys = Object.keys(props);
				const propValues = Object.values(props);

				for (let index = 0; index < propKeys.length; index++) {
					const key = parseInt(propKeys[index]);
					const value = propValues[index];

					this.props[key] = value;
				}
			}

			if (data.registrationDate) this.setRegisterDate(Number(data.registrationDate));
			if (data.nameCardId) this.setNameCardId(data.nameCardId);
			if (data.travelerId) this.setTravellerId(data.travelerId);
			if (data.birthday) this.setBirthday({
				month: data.birthday.month ?? 0,
				day: data.birthday.day ?? 0
			});

			return true;
		} else {
			return false;
		}
	}
}

export class PlayerDataManager {
	public session: Session;
	private schema;

	constructor(session: Session) {
		this.session = session;
		this.schema = model;
	}

	public async retrievePlayerData(uid: number) {
		const playerData = new PlayerData(uid);
		const saveValidity = await playerData.loadFromSave();
		if (!saveValidity) return undefined;
		return playerData;
	}

	public async retrieveSelfData() {
		const playerData = new PlayerData(this.session.uid);
		await playerData.loadFromSave();
		return playerData;
	}
}