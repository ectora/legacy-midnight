import {
	AvatarInfo,
	AvatarTeam, AvatarTeamUpdateNotify,
	Item,
	MotionState,
	SceneTeamAvatar, SceneTeamUpdateNotify,
	Vector, VisionType
} from "bazal";

import { Session } from "../../../structures/kcp/Session";
import { Avatar } from "./Avatar";
import mongoose from "mongoose";

export const model = mongoose.model("avatar", new mongoose.Schema({
	owner_id: String,
	avatars: [{}],
	teams: {},
	curTeam: Number,
	curAvatarGuid: Number,
	nextFieldGoingBlankIdkWhy: Boolean
}));

export class AvatarManager {
	public guidAliases: Map<number, number> = new Map();
	public avatars: Map<string, Avatar> = new Map();
	public teams: { [key: number]: number[] } = [];
	public session: Session;

	public curTeamIndex = 1;
	public curAvatarGuid = 0;
	private schema;

	constructor(session: Session) {
		this.session = session;

		this.teams = {
			1: [],
			2: [],
			3: [],
			4: []
		};

		this.schema = model;
	}

	public getAvatarList() {
		return Array.from(this.avatars.values());
	}

	public addAvatar(avatar: Avatar) {
		return this.avatars.set(avatar.id.toString(), avatar);
	}

	getTeam(index: number): number[] {
		return this.teams[index];
	}

	getTeamMap() {
		const teamMap: { [key: number]: AvatarTeam } = [];
		for (let i = 1; i < 5; i++) {
			teamMap[i] = AvatarTeam.create({
				avatarGuidList: this.getTeam(i).map(team => BigInt(team)),
				teamName: '',
			});
		}

		return teamMap;
	}

	getAvatarByGuid(guid: number): Avatar | null {
		for (let avatar of Array.from(this.avatars.values())) {
			if (avatar.getAvatarInfo().guid === BigInt(guid)) {
				return avatar;
			}
		}

		return null;
	}

	setCurAvatarGuid(curAvatarGuid: number) {
		const oldAvatar = this.getAvatarByGuid(this.curAvatarGuid);
		const newAvatar = this.getAvatarByGuid(curAvatarGuid);

		if (!oldAvatar) {
			if (newAvatar) {
				this.curAvatarGuid = newAvatar.guid;
				return true;
			} else {
				return false;
			}
		} else {
			if (newAvatar) {
				const oldEntityInfo = oldAvatar.getSceneEntityInfo();
				const newEntityInfo = newAvatar.getSceneEntityInfo();
				this.session.getWorld().killEntity(oldEntityInfo);
				newEntityInfo.motionInfo = oldEntityInfo.motionInfo;
				this.session.getWorld().addEntity(newEntityInfo);
				return true;
			} else {
				return false;
			}
		}
	}

	setTeam(index: number, avatars: number[], requestTeamChange = true) {
		this.teams[index] = avatars;
		if (requestTeamChange) {
			this.updateTeam();
		}
	}

	updateTeam() {
		const curTeam = this.getTeam(this.curTeamIndex);
		const teamList: SceneTeamAvatar[] = [];

		curTeam.forEach((e) => {
			teamList.push(this.getAvatarByGuid(e)!.getSceneTeamAvatar());
		});

		const sceneTeamUpdate: SceneTeamUpdateNotify = SceneTeamUpdateNotify.create({ sceneTeamAvatarList: teamList });

		this.session.send("AvatarTeamUpdateNotify", Buffer.from(
			AvatarTeamUpdateNotify.toBinary({ avatarTeamMap: this.getTeamMap(), tempAvatarGuidList: [] })
		), BigInt(Date.now()));

		this.session.send("SceneTeamUpdateNotify", Buffer.from(SceneTeamUpdateNotify.toBinary(sceneTeamUpdate)), BigInt(Date.now()));
	}

	public async save() {
		const avatars = Array.from(this.avatars.values());
		let data = await this.schema.findOne({ owner_id: this.session.uid.toString() });

		if (!data) {
			data = await this.schema.create({
				owner_id: this.session.uid.toString(),
				avatars: avatars.map(avatar => avatar.toJSON()),
				teams: this.teams,
				curTeam: this.curTeamIndex,
				curAvatarGuid: this.curAvatarGuid
			});
			data.save();
			return;
		} else {
			data.update({
				owner_id: this.session.uid.toString(),
				avatars: avatars.map(avatar => avatar.toJSON()),
				teams: this.teams,
				curTeam: this.curTeamIndex,
				curAvatarGuid: this.curAvatarGuid
			});
			data.save();
			return;
		}
	}

	public init() {
		return (async () => {
			let data = await this.schema.findOne({ owner_id: this.session.uid.toString() }).lean().exec();
			const playerInventory = this.session.getPlayer().getInventory();

			if (data) {
				console.log(data);
				if (("avatars" in data && data.avatars) &&
				("teams" in data && data.teams) && ("curTeam" in data && data.curTeam) &&
				("curAvatarGuid" in data && data.curAvatarGuid)) {

					const curAvatarGuid = data.curAvatarGuid || data["curAvatarGuid"];
					const avatars = data.avatars || data["avatars"];
					const curTeam = data.curTeam || data["curTeam"];
					const teams = data.teams || data["teams"];

					// fuck the properties that goes null after defining them.
					for (const avatar of avatars as unknown as [{
						guid: number, avatarInfo: string,
						weaponItemData: string
					}]) {
						const avatarInfo = AvatarInfo.fromBinary(Buffer.from(avatar.avatarInfo, "base64"));
						const weaponItemData = Item.fromBinary(Buffer.from(avatar.weaponItemData, "base64"));
						const refreshedItemData = playerInventory.getItem(weaponItemData.guid.toString());
	
						if (refreshedItemData) {
							const reinstantiatedAvatar = new Avatar(this.session, avatarInfo, this.session.getPlayer().position);
							reinstantiatedAvatar.guid = this.session.getWorld().getNextGuid();
							reinstantiatedAvatar.equipWeapon(refreshedItemData.toItem());
							this.guidAliases.set(avatar.guid, reinstantiatedAvatar.guid);
							return this.addAvatar(reinstantiatedAvatar);
						} else {
							const reinstantiatedAvatar = new Avatar(this.session, avatarInfo, this.session.getPlayer().position);
							reinstantiatedAvatar.guid = this.session.getWorld().getNextGuid();
							weaponItemData.guid = BigInt(this.session.getWorld().getNextGuid());
							reinstantiatedAvatar.equipWeapon(weaponItemData);
							this.guidAliases.set(avatar.guid, reinstantiatedAvatar.guid);
							return this.addAvatar(reinstantiatedAvatar);
						}
					}
	
					const resfreshedCurAvatarGuid = this.guidAliases.get(curAvatarGuid);

					// @ts-ignore
					const isCurAvatarApplied = this.setCurAvatarGuid(resfreshedCurAvatarGuid);

					if (isCurAvatarApplied) {
						this.curTeamIndex = curTeam;
		
						if (data.teams) {
							const avatarTeam: number[] = teams[curTeam];
							const refreshedTeam: number[] = [];
		
							// Iterate old avatar GUIDs to use their new cached GUID.
							for (const avatarGuid of avatarTeam) {
								const newGuid = this.guidAliases.get(avatarGuid);
		
								if (!newGuid) {
									continue;
								} else {
									refreshedTeam.push(newGuid);
								}
							}
		
							this.setTeam(curTeam, refreshedTeam);
						}
					}
				}
			} else {
				return;
			}
		})();
	}
}