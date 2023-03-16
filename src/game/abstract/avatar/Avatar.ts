import {
	AbilityEmbryo, AvatarInfo, AvatarEnterSceneInfo,
	FightPropPair, Item, PropPair, ProtEntityType,
	SceneWeaponInfo, SceneTeamAvatar, SceneEntityInfo,
	SceneAvatarInfo, Vector,
} from "bazal";

import { ResourceFactory } from "../../factory/ResourceFactory";
import { Session } from "../../../structures/kcp/Session";
import { World } from "../World";

export class Avatar {
	private weaponInfo: SceneWeaponInfo = SceneWeaponInfo.create({});
	private weaponItemData: Item = Item.create({});
	public embryos: AbilityEmbryo[] = [];
	private avatarInfo: AvatarInfo;
	private session: Session;
	public motion: Vector;
	private world: World;
	public guid;
	public id;

	constructor(session: Session, avatarInfo: AvatarInfo, motion: Vector) {
		this.motion = motion;
		this.session = session;
		this.avatarInfo = avatarInfo;
		this.world = session.getWorld();
		this.guid = Number(this.avatarInfo.guid);
		this.id = this.world.getNextEntityId(ProtEntityType.AVATAR);
	}

	public getAvatarInfo() {
		return this.avatarInfo;
	}

	getSceneTeamAvatar(isPlayerCurAvatar = true): SceneTeamAvatar {
		return SceneTeamAvatar.create({
			sceneId: this.world.getSceneId(),
			playerUid: this.session.uid,
			avatarGuid: BigInt(this.guid),
			entityId: this.id,
			weaponGuid: this.weaponInfo.guid,
			weaponEntityId: this.weaponInfo.entityId,
			isPlayerCurAvatar: isPlayerCurAvatar,
			sceneEntityInfo: this.getSceneEntityInfo(),
			abilityControlBlock: {
				abilityEmbryoList: this.embryos,
			}
		});
	}

	getSceneEntityInfo(): SceneEntityInfo {
		const propList: PropPair[] = [];
		for (const prop of Object.keys(this.avatarInfo.propMap).map(key => Number(key))) {
			propList.push(
				PropPair.create({ type: prop, propValue: this.avatarInfo.propMap[prop] })
			);
		}

		const fightPropList: FightPropPair[] = [];
		for (const prop of Object.keys(this.avatarInfo.fightPropMap).map(key => Number(key))) {
			fightPropList.push(
				FightPropPair.create({
					propType: prop,
					propValue: this.avatarInfo.fightPropMap[prop]
				})
			);
		}

		return SceneEntityInfo.create({
			entityId: this.id,
			lifeState: 1,
			motionInfo: {
				pos: this.motion,
				rot: Vector.create({ x: 0, y: 0, z: 0 }),
				speed: Vector.create({ x: 0, y: 0, z: 0 }),
			},
			entityAuthorityInfo: {
				aiInfo: { isAiOpen: true },
			},
			entityType: ProtEntityType.AVATAR,
			propList: propList,
			fightPropList: fightPropList,
			entity: {
				oneofKind: "avatar",
				avatar: this.getSceneAvatarInfo()
			}
		});
	}

	getSceneAvatarInfo(): SceneAvatarInfo {
		return SceneAvatarInfo.create({
			uid: this.session.uid,
			guid: BigInt(this.guid),
			wearingFlycloakId: 140001,
			inherentProudSkillList: this.avatarInfo.inherentProudSkillList,
			proudSkillExtraLevelMap: this.avatarInfo.proudSkillExtraLevelMap,
			skillLevelMap: this.avatarInfo.skillLevelMap,
			talentIdList: this.avatarInfo.talentIdList,
			coreProudSkillLevel: this.avatarInfo.coreProudSkillLevel,
			bornTime: Math.round(Date.now() / 1000),
			skillDepotId: this.avatarInfo.skillDepotId,
			avatarId: this.avatarInfo.avatarId,
			peerId: 1,
			weapon: this.weaponInfo,
			equipIdList: [Number(this.weaponInfo.guid)],
			teamResonanceList: this.avatarInfo.teamResonanceList
		});
	}

	getAvatarEnterSceneInfo(): AvatarEnterSceneInfo {
		return AvatarEnterSceneInfo.create({
			avatarGuid: BigInt(this.guid),
			avatarEntityId: this.id,
			weaponEntityId: this.weaponInfo.entityId,
			weaponGuid: this.weaponInfo.guid,
		});
	}

	public equipWeapon(item: Item) {
		if (item.detail.oneofKind && item.detail.oneofKind === "equip") {
			const equipData = item.detail.equip;
			const weaponExcel = ResourceFactory.weaponExcels.get(item.itemId);

			if (equipData.detail.oneofKind === "weapon" && equipData.detail.weapon && weaponExcel) {
				this.weaponInfo = SceneWeaponInfo.create({
					entityId: this.world.getNextEntityId(ProtEntityType.WEAPON),
					guid: BigInt(this.world.getNextGuid()),
					itemId: item.itemId,
					level: equipData.detail.weapon.level,
					promoteLevel: equipData.detail.weapon.promoteLevel,
					gadgetId: weaponExcel.gadgetId,
					abilityInfo: {}
				});
				this.weaponItemData = item;
			}
		}
	}

	public toJSON() {
		return {
			guid: this.guid,
			avatarInfo: Buffer.from(
				AvatarInfo.toBinary(this.avatarInfo)
			).toString("base64"),
			weaponItemData: Buffer.from(
				Item.toBinary(this.weaponItemData)
			).toString("base64")
		};
	}

	// Test function, though reliquaries (artifacts) are still a work in progress.
	// public equipReliquary(item: Item) {
	// 	if (item.detail.oneofKind && item.detail.oneofKind === "equip") {
	// 		const equipData = item.detail.equip;

	// 		if (equipData.detail.oneofKind === "reliquary" && equipData.detail.reliquary) {
	// 			const reliquaryData = equipData.detail.reliquary;
	// 		}
	// 	}
	// }
}