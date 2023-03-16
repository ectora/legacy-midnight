import { 
	MpSettingType,
	ProtEntityType, SceneEntityAppearNotify, SceneEntityDisappearNotify,
	SceneEntityInfo, ScenePlayerInfo, VisionType
} from "bazal";
import { Session } from "../../structures/kcp/Session";
import { AvatarManager } from "./avatar/AvatarManager";

export class World {
	private session: Session;
	private guid: number = 2;
	private sceneId: number = 0;
	private entityId: number = 0;
	private mpLevelEntityId: number;
	private avatarManager: AvatarManager;
	private isMultiplayer: boolean = false;
	private entities: { [key: number]: SceneEntityInfo } = {};

	constructor(session: Session) {
		this.session = session;
		this.avatarManager = new AvatarManager(session);
		this.mpLevelEntityId = this.getNextEntityId(ProtEntityType.MP_LEVEL);
	}

	public getNextEntityId(protEntityType: number) {
		return (protEntityType << 24) + ++this.entityId;
	}

	public getNextGuid() {
		return ++this.guid;
	}

	public getSession() {
		return this.session;
	}

	public getAvatarManager() {
		return this.avatarManager;
	}

	public getMpLevelEntityId() {
		return this.mpLevelEntityId;
	}

	public getSceneId() {
		return this.sceneId;
	}

	public setSceneId(id: number) {
		this.sceneId = id;
	}

	public getEntityById(id: number) {
		return this.entities[id] ?? null;
	}

	public getPlayers() {

	}

	public async getPlayersInfo() {
		if (!this.isMultiplayer) {
			const dataManager = this.session.getPlayer().getDataManager();
			const profileInfo = await dataManager.retrieveSelfData();

			return [
				ScenePlayerInfo.create({
					uid: this.session.uid, sceneId: this.getSceneId(),
					peerId: 1, onlinePlayerInfo: {
						uid: this.session.uid,
						// @ts-ignore
						nickname: profileInfo.getNickname(),
						playerLevel: 1,
						worldLevel: 0,
						profilePicture: profileInfo.getProfilePicture(),
						blacklistUidList: [],
						signature: profileInfo.getSignature(),
						// @ts-ignore
						nameCardId: profileInfo.getNameCardId(),
						mpSettingType: MpSettingType.ENTER_AFTER_APPLY
					}, isConnected: this.session.connection.connected,
					name: profileInfo.getNickname()
				})
			]
		}

		return [
			ScenePlayerInfo.create({})
		]
	}

	public killEntity(entityInfo: SceneEntityInfo, visionType: VisionType = VisionType.DIE) {
		this.session.send("SceneEntityDisappearNotify", Buffer.from(
			SceneEntityDisappearNotify.toBinary({
				entityList: [entityInfo.entityId],
				disappearType: visionType,
				param: 0
			})
		), BigInt(Date.now()));

		// this.entities[entityInfo.entityId] = null;
		delete this.entities[entityInfo.entityId];
	}

	public addEntity(entityInfo: SceneEntityInfo, visionType: VisionType = VisionType.BORN) {
		this.session.send("SceneEntityAppearNotify", Buffer.from(
			SceneEntityAppearNotify.toBinary({
				entityList: [entityInfo],
				appearType: visionType,
				param: 0
			})
		), BigInt(Date.now()));

		this.entities[entityInfo.entityId] = entityInfo;
	}
}