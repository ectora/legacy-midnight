import { Session } from "../../structures/kcp/Session";
import { GameConstants } from "../factory/enum/GameConstants";
import { DataProperties } from "../factory/enum/DataProperties";
import {
	AreaPlayInfoNotify, AreaPlayType, AvatarDataNotify,
	EnterType, OpenStateUpdateNotify, PlayerDataNotify,
	PlayerStoreNotify, StoreType, StoreWeightLimitNotify,
	Vector, PropValue, SetPlayerBornDataReq, PlayerEnterSceneNotify
} from "bazal";
import { Avatar } from "./avatar/Avatar";
import { Storage } from "./inventory/Storage";
import Utils from "../../structures/utils/Utils";
import { MailManager } from "./mail/MailManager";
import { StorageEntry } from "./inventory/StorageEntry";
import { ResourceFactory } from "../factory/ResourceFactory";
import { PlayerDataManager } from "./player/PlayerDataManager";

export enum EnterReason {
	None = 0,
	Login = 1,
	DungeonReplay = 11,
	DungeonReviveOnWaypoint = 12,
	DungeonEnter = 13,
	DungeonQuit = 14,
	Gm = 21,
	QuestRollback = 31,
	Revival = 32,
	PersonalScene = 41,
	TransPoint = 42,
	ClientTransmit = 43,
	ForceDragBack = 44,
	TeamKick = 51,
	TeamJoin = 52,
	TeamBack = 53,
	Muip = 54,
	DungeonInviteAccept = 55,
	Lua = 56,
	ActivityLoadTerrain = 57,
	HostFromSingleToMp = 58,
	MpPlay = 59,
	AnchorPoint = 60,
	LuaSkipUi = 61,
	ReloadTerrain = 62,
	DraftTransfer = 63,
	EnterHome = 64,
	ExitHome = 65,
	ChangeHomeModule = 66,
	Gallery = 67,
	HomeSceneJump = 68,
	HideAndSeek = 69
}

export class Player {
	public position: Vector;
	private session: Session;
	private entityId: number = 0;
	private inventory: Storage;
	private mailManager: MailManager;
	private dataManager: PlayerDataManager;
	private isMultiplayer: boolean = false;
	private playerProp: { [type: number]: number } = {};

	constructor(session: Session) {
		this.position = GameConstants.START_POSITION;
		this.dataManager = new PlayerDataManager(session);
		this.mailManager = new MailManager(session);
		this.inventory = new Storage(session);
		this.session = session;
		this.initDataProp();
	}

	private initDataProp() {
		this.playerProp[DataProperties.PROP_PLAYER_RESIN] = 160;
		this.playerProp[DataProperties.PROP_MAX_SPRING_VOLUME] = 8500000;
		this.playerProp[DataProperties.PROP_CUR_SPRING_VOLUME] = 8500000;
		this.playerProp[DataProperties.PROP_IS_SPRING_AUTO_USE] = 0;
		this.playerProp[DataProperties.PROP_SPRING_AUTO_USE_PERCENT] = 50;
		this.playerProp[DataProperties.PROP_IS_FLYABLE] = 0;
		this.playerProp[DataProperties.PROP_IS_WEATHER_LOCKED] = 1;
		this.playerProp[DataProperties.PROP_IS_GAME_TIME_LOCKED] = 1;
		this.playerProp[DataProperties.PROP_IS_TRANSFERABLE] = 1;
		this.playerProp[DataProperties.PROP_MAX_STAMINA] = 24000;
		this.playerProp[DataProperties.PROP_CUR_PERSIST_STAMINA] = 24000;
		this.playerProp[DataProperties.PROP_IS_MP_MODE_AVAILABLE] = 1;
            this.playerProp[DataProperties.PROP_PLAYER_MP_SETTING_TYPE] = 1;
            this.playerProp[DataProperties.PROP_PLAYER_WORLD_LEVEL] = 0;
            this.playerProp[DataProperties.PROP_PLAYER_LEVEL] = 1;
            this.playerProp[DataProperties.PROP_PLAYER_EXP] = 0;
	}

	public getPlayerProp() {
            const propMap: { [type: number]: PropValue } = {}
            for (const type in this.playerProp) {
                  propMap[Number(type)] = PropValue.create({
                        type: Number(type),
                        val: BigInt(this.playerProp[type]),
                        value: {
                              oneofKind: "ival",
                              ival: BigInt(this.playerProp[type]),
                        }
                  });
            }

            return propMap;
      }

	public getPlayerPropVal(playerProp: DataProperties) {
		return this.playerProp[playerProp] ?? 0;
	}

	public getPlayerPropMap() {
		return this.playerProp;
	}

	public getMailManager() {
		return this.mailManager;
	}

	public getInventory() {
		return this.inventory;
	}

	public getAvatarManager() {
		return this.session.getWorld().getAvatarManager();
	}

	public getDataManager() {
		return this.dataManager;
	}

	public setPlayerPropVal(playerProp: DataProperties, propValue: number) {
		this.playerProp[playerProp] = propValue;
	}

	public setPosition(position: Vector) {
            this.position = position;
      }

	public teleport(
            sceneId: number,
            position: Vector,
            type = EnterType.SELF,
            enterReason = 3,
            recvMs: bigint
      ): void {
		const sceneIds: number[] = [];
            for (let i = 0; i < 3000; i++) {
                  sceneIds.push(i);
            }

		const teleport = PlayerEnterSceneNotify.create({
                  sceneId: sceneId,
                  pos: position,
                  sceneBeginTime: BigInt(Date.now()),
                  type: type,
                  enterReason: enterReason,
                  isFirstLoginEnterScene: false,
                  targetUid: this.session.uid,
                  enterSceneToken: Utils.getRandomInt(1000,9999),
                  worldType: 1,
                  worldLevel: 1, dungeonId: 0,
                  sceneTransaction: "3-" + this.session.uid + "-" + Date.now() / 1000 + "-67458",
            });

		if (enterReason === 1) {
                  teleport.isFirstLoginEnterScene = true;
            } else {
                  this.position = position;
                  teleport.prevSceneId = this.session.getWorld().getSceneId();
                  this.session.getWorld().setSceneId(sceneId);
            }

            teleport.sceneTagIdList = sceneIds;
            this.session.send("PlayerEnterSceneNotify", Buffer.from(PlayerEnterSceneNotify.toBinary(teleport)), recvMs);
      }

	public async onLogin() {
		const recvMs = BigInt(Date.now());
		const playerData = await this.getDataManager().retrieveSelfData();
		await playerData.loadFromSave();

		const lastPlayerProp = playerData.getPlayerProp();
		const playerPropDelta = Object.keys(lastPlayerProp).map(delta => parseInt(delta));
		const playerPropValue = Object.values(lastPlayerProp);

		for (let index = 0; index < playerPropDelta.length; index++) {
			const propDelta = playerPropDelta[index];
			const propValue = playerPropValue[index];
			this.setPlayerPropVal(propDelta, propValue);
		}

		this.session.send("PlayerDataNotify", Buffer.from(PlayerDataNotify.toBinary({
			// @ts-ignore
			regionId: 1, serverTime: recvMs, nickName: playerData.getNickname(), isFirstLoginToday: false,
			propMap: this.getPlayerProp()
		})), recvMs);

		const openStateMap: { [key: number]: number } = {};
		for (let i = 0; i < 5000; i++) { openStateMap[i] = 1; }

		this.session.send("OpenStateUpdateNotify", Buffer.from(OpenStateUpdateNotify.toBinary({ openStateMap: openStateMap })), recvMs);
		this.session.send("AreaPlayInfoNotify", Buffer.from(AreaPlayInfoNotify.toBinary({ detailPlayType: 0, areaPlayType: AreaPlayType.NONE })), recvMs);
		this.session.send("StoreWeightLimitNotify", Buffer.from(StoreWeightLimitNotify.toBinary({
			storeType: StoreType.PACK,
			weightLimit: 30000,
			materialCountLimit: 2000,
			weaponCountLimit: 2000,
			reliquaryCountLimit: 1500,
			furnitureCountLimit: 2000
		})), recvMs);

		this.session.send("PlayerStoreNotify", Buffer.from(PlayerStoreNotify.toBinary({
			storeType: StoreType.PACK,
			weightLimit: 30000,
			itemList: this.getInventory().getItems()
				.map(item => item.toItem()),
		})), recvMs);

		this.session.send("AvatarDataNotify", Buffer.from(AvatarDataNotify.toBinary(
			AvatarDataNotify.create({
				ownedCostumeList: [200302, 202101, 204101, 204501],
				backupAvatarTeamOrderList: [],
				tempAvatarGuidList: [],
				ownedFlycloakList: [
					140002, 140003, 140001, 140006, 140007, 140004, 140005, 140010, 140008,
					140009,
				],
				avatarList: this.getAvatarManager().getAvatarList()
					.map(avatar => avatar.getAvatarInfo()),
				avatarTeamMap: this.getAvatarManager().getTeamMap(),
				chooseAvatarGuid: BigInt(this.getAvatarManager().curAvatarGuid),
				curAvatarTeamId: 1
			})
		)), recvMs);

		this.teleport(3, GameConstants.START_POSITION, EnterType.SELF, 1, recvMs);
		this.session.getWorld().setSceneId(3);
	}

	public async onBorn(bornData: SetPlayerBornDataReq) {
		const recvMs = BigInt(Date.now());
		const playerData = await this.dataManager.retrieveSelfData();

		// Pre-configure profile info.
		playerData.setRegisterDate();
		playerData.setNickname(bornData.nickName);
		playerData.setTravellerId(bornData.avatarId);
		playerData.setProfilePicture({ avatarId: bornData.avatarId, costumeId: 0 });
		playerData.setPlayerProp(this.getPlayerPropMap());
		await playerData.saveChanges();

		this.session.send("PlayerDataNotify", Buffer.from(PlayerDataNotify.toBinary({
			regionId: 1, serverTime: recvMs, nickName: bornData.nickName, isFirstLoginToday: true,
			propMap: this.getPlayerProp()
		})), recvMs);

		const openStateMap: { [key: number]: number } = {};
		for (let i = 0; i < 5000; i++) { openStateMap[i] = 1; }

		this.session.send("OpenStateUpdateNotify", Buffer.from(OpenStateUpdateNotify.toBinary({ openStateMap: openStateMap })), recvMs);
		this.session.send("AreaPlayInfoNotify", Buffer.from(AreaPlayInfoNotify.toBinary({ detailPlayType: 0, areaPlayType: AreaPlayType.NONE })), recvMs);
		this.session.send("StoreWeightLimitNotify", Buffer.from(StoreWeightLimitNotify.toBinary({
			storeType: StoreType.PACK,
			weightLimit: 30000,
			materialCountLimit: 2000,
			weaponCountLimit: 2000,
			reliquaryCountLimit: 1500,
			furnitureCountLimit: 2000
		})), recvMs);

		const defaultWeapon = new StorageEntry({
			itemId: 11101,
			guid: BigInt(this.session.getWorld().getNextGuid()),
			detail: {
				oneofKind: "equip", equip: {
					isLocked: false,
					detail: { oneofKind: "weapon", weapon: { level: 1, exp: 0, promoteLevel: 0, affixMap: {} } }
				}
			}
		});

		this.getInventory().addItem(defaultWeapon);
		this.session.send("PlayerStoreNotify", Buffer.from(PlayerStoreNotify.toBinary({
			storeType: StoreType.PACK,
			weightLimit: 30000,
			itemList: this.getInventory().getItems()
				.map(item => item.toItem()),
		})), recvMs);

		const { avatarInfo } = ResourceFactory.avatars[bornData.avatarId];
		avatarInfo.guid = BigInt(this.session.getWorld().getNextGuid());
		const travellerAvatar = new Avatar(this.session, avatarInfo, GameConstants.START_POSITION);

		travellerAvatar.equipWeapon(defaultWeapon.toItem());
		this.getAvatarManager().addAvatar(travellerAvatar);
		this.getAvatarManager().setCurAvatarGuid(travellerAvatar.guid);
		await this.getInventory().save();

		this.session.send("AvatarDataNotify", Buffer.from(AvatarDataNotify.toBinary(
			AvatarDataNotify.create({
				ownedCostumeList: [200302, 202101, 204101, 204501],
				backupAvatarTeamOrderList: [],
				tempAvatarGuidList: [],
				ownedFlycloakList: [
					140002, 140003, 140001, 140006, 140007, 140004, 140005, 140010, 140008,
					140009
				],
				avatarList: this.getAvatarManager().getAvatarList()
					.map(avatar => avatar.getAvatarInfo()),
				avatarTeamMap: this.getAvatarManager().getTeamMap(),
				chooseAvatarGuid: BigInt(this.getAvatarManager().curAvatarGuid),
				curAvatarTeamId: 1
			})
		)), recvMs);

		this.teleport(3, GameConstants.START_POSITION, EnterType.SELF, 1, recvMs);
		this.session.getWorld().setSceneId(3);
	}
}