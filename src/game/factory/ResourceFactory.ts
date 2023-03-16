import fs from "fs";
import { resolve } from "path";

import { AvatarInfo, AbilityEmbryo, SceneMonsterInfo, SceneFishInfo, MonsterBornType, PropValue, Weapon } from "bazal";
import { AvatarDepot } from "./abstract/AvatarDepot";
import Logger from "../../structures/utils/Logger";

import { InherentProudSkillOpen } from "./abstract/InherentProudSkillOpen";
import { GameConstants, WeaponType } from "./enum/GameConstants";
import { MonsterExcel, WeaponExcel } from "./enum/ExcelTypes";
import { EntityProperties } from "./enum/EntityProperties";
import { FightProperties } from "./enum/FightProperties";
import stripJsonComments from 'strip-json-comments';
import Utils from "../../structures/utils/Utils";

function readFile(...args: string[]) {
	return fs.readFileSync(resolve(process.cwd(), ...args)).toString();
}

function readDir(...args: string[]) {
	return fs.readdirSync(resolve(process.cwd(), ...args)).toString();
}

export class ResourceFactory {
	public static emojis: number[] = [];
	public static namecards: number[] = [];
	public static shopMalls: number[] = [];
	public static avatarCards: number[] = [];
	public static depots: AvatarDepot[] = [];
	public static gadgets: {[key: number]: string } = [];
	public static embryos: { [type: string]: AbilityEmbryo[] } = {};
	public static avatars: { [key: number]: { weaponType: WeaponType, avatarInfo: AvatarInfo } } = [];

	public static weapons: Map<number, Weapon> = new Map();
	public static fishes: Map<number, MonsterExcel> = new Map();
	public static weaponExcels: Map<number, WeaponExcel> = new Map();
	public static monsters: Map<number, SceneMonsterInfo> = new Map();
	public static scenePoints: Map<string, { pos: { x: number, y: number, z: number }; }> = new Map();

	private static idTranslate: { [key: number]: string } = [];

	public static DungeonExcelConfigData: {};
	public static WeaponExcelConfigData: {};

	static init() {
		this.initSkillDepot();			// character skills
		this.initMaterialExcel();		// inventory materials
		this.initChatEmojiExcel();		// chat emojis
		this.initShopExcelConfigData();	// shop items
		this.initEmbryos();			// ability embryo
		this.initAvatarExcel();			// character excels (character information)
		this.initGadgets();			// gadgets
		this.initMonsterExcel();		// monsters
		this.initScenePoints();			// teleport waypoints
		this.initWeaponExcel();			// weapons

		this.DungeonExcelConfigData = this.loadResourceFile("DungeonExcelConfigData");
	}

	private static loadResourceFile(file: string, resourceType: ResourceType = ResourceType.ExcelBinOutput) {
		try {
			switch (resourceType) {
				case ResourceType.ExcelBinOutput:
					Logger.verbose(`<DepotManager>: Loaded ${file} excel.`);
					return JSON.parse(readFile('src/data/Resources/ExcelBinOutput', file + '.json'));

				case ResourceType.AvatarBinOutput:
					return JSON.parse(readFile('src/data/Resources/BinOutput/Avatar/', file));

				case ResourceType.MonsterBinOutput:
					return JSON.parse(
						stripJsonComments(readFile('src/data/Resources/BinOutput/Monster/', file))
					);

				case ResourceType.BinOutput:
					return JSON.parse(readFile('src/data/Resources/BinOutput', file + '.json'));
			}
		} catch (error) {
			// @ts-ignore
			Logger.error(`<DepotManager>: Could not load excel ${file}: ${error.message}`);
		}
	}

	private static initScenePoints() {
		let count = 0;
		const files = readDir('src/data/Resources/BinOutput/Scene/Point').split(/,/g);
		const scenes = files.map(file => file.replace("scene", "").split(/_/g)[0]);

		for (const scene of scenes) {
			const sceneData = JSON.parse(readFile('src/data/Resources/BinOutput/Scene/Point/', `scene${scene}_point.json`));

			if (!("points" in sceneData)) {
				continue;
			} else {
				const points = Object.keys(sceneData.points);

				points.forEach(point => {
					const pointData = sceneData.points[point];
					if ("pos" in pointData) {
						count++;
						this.scenePoints.set(`${scene}_${point}`, {
							pos: {
								x: pointData.pos.x || pointData.pos._x,
								y: pointData.pos.y || pointData.pos._y,
								z: pointData.pos.z || pointData.pos._z
							}
						});
					}
				})
			}
		}

		Logger.verbose(`<DepotManager>: Mapped ${count} scene points`)
	}

	private static initMonsterExcel() {
		const _monsters: MonsterExcel[] = this.loadResourceFile('MonsterExcelConfigData');
		Logger.verbose(`<DepotManager>: Catched ${_monsters.length} monster excel.`);

		try {
			for (const monster of _monsters) {
				switch (monster.type) {
					case "MONSTER_ORDINARY":
						switch (monster.securityLevel) {
							case "ELITE":
							case "BOSS":
								this.monsters.set(monster.id, SceneMonsterInfo.create({
									monsterId: monster.id, isElite: true,
									groupId: monster.featureTagGroupID,
									authorityPeerId: 1,
									bornType: MonsterBornType.DEFAULT,
									specialNameId: monster.nameTextMapHash, ownerEntityId: monster.campID,
									weaponList: [],
									affixList: monster.affix ? monster.affix : [],
									summonTagMap: {},
									content: { oneofKind: undefined }
								}));
								break;

							default:
								this.monsters.set(monster.id, SceneMonsterInfo.create({
									monsterId: monster.id,
									groupId: monster.featureTagGroupID,
									authorityPeerId: 1,
									bornType: MonsterBornType.DEFAULT,
									specialNameId: monster.nameTextMapHash, ownerEntityId: monster.campID,
									weaponList: [],
									affixList: monster.affix ? monster.affix : [],
									summonTagMap: {},
									content: { oneofKind: undefined }
								}));
								break;
						}
						break;

					case "MONSTER_FISH":
						this.fishes.set(monster.id, monster);
						break;

					case "MONSTER_ORDINARY":
					case "MONSTER_ENV_ANIMAL":
						this.monsters.set(monster.id, SceneMonsterInfo.create({
							monsterId: monster.id,
							groupId: monster.featureTagGroupID,
							authorityPeerId: 1,
							bornType: MonsterBornType.DEFAULT,
							specialNameId: monster.nameTextMapHash, ownerEntityId: monster.campID,
							weaponList: [],
							affixList: monster.affix ? monster.affix : [],
							summonTagMap: {},
							content: { oneofKind: undefined }
						}));
						break;

					default:
						break;
				}
			}

			Logger.verbose(`<DepotManager>: Mapped ${this.monsters.size} monster excels.`);
		} catch (error) {
			Logger.error(error);
		}

		// Logger.verbose(`<DepotManager>: Loaded ${this.monsters.length} monster scene infos.`);
	}

	private static initEmbryos() {
		let count = 0;
		const files = readDir('src/data/Resources/BinOutput/Avatar').split(/,/g);

		for (const file of files) {
			if (file.includes('Manekin') || file.includes('Test') || file.includes('Nude')) {
				continue;
			} else {
				count++;
				const binData = this.loadResourceFile(file, ResourceType.AvatarBinOutput);

				if (binData['abilities'] === undefined) {
					continue;
				}

				let embryoId = 0;

				const abilities: AbilityEmbryo[] = [];

				GameConstants.DEFAULT_ABILITY_STRINGS.forEach((element) => {
					abilities.push(
						AbilityEmbryo.create({
							abilityId: ++embryoId,
							abilityNameHash: Utils.abilityHash(element),
							abilityOverrideNameHash: Utils.abilityHash(GameConstants.DEFAULT_ABILITY_NAME)
						})
					);
				});

				// @ts-ignore
				binData['abilities'].forEach((element) => {
					abilities.push(AbilityEmbryo.create({
						abilityId: ++embryoId,
						abilityNameHash: Utils.abilityHash(element['abilityName']),
						abilityOverrideNameHash: Utils.abilityHash(GameConstants.DEFAULT_ABILITY_NAME)
					}));
				});

				this.embryos[file.split('_')[1].replace('.json', '')] = abilities;
			}
		}
	}

	private static initSkillDepot() {
		const skillDepot: [] = this.loadResourceFile('AvatarSkillDepotExcelConfigData');
		const avatarSkillExcelConfigData: [] = this.loadResourceFile('AvatarSkillExcelConfigData');

		for (let skill of avatarSkillExcelConfigData) {
			if (skill['proudSkillGroupId'] === undefined) {
				continue;
			} else {
				InherentProudSkillOpen.proudSkillExtraMap[skill['id']] = skill['proudSkillGroupId'];
			}
		}
	  
		// console.table(InherentProudSkillOpen.proudSkillExtraMap)
	  
		for (let depot of skillDepot) {
			if (depot['energySkill'] === undefined) {
				continue;
			}
		
			const skillMap = [
				depot['skills'][0],
				depot['skills'][1],
				depot['energySkill']
			];
		
			const proudSkillOpens: InherentProudSkillOpen[] = [];
			const inherentproudSkillList: [] = depot['inherentProudSkillOpens'];
		
			for (let proudSkillOpen of inherentproudSkillList) {
				if (proudSkillOpen['proudSkillGroupId'] === undefined) {
					continue;
				}
			
				proudSkillOpens.push(new InherentProudSkillOpen(
					proudSkillOpen['proudSkillGroupId'] * 100 + 1,
					proudSkillOpen['needAvatarPromoteLevel'] ?? 0
				));
			}

			this.depots[depot['id']] = new AvatarDepot(skillMap, depot['subSkills'], depot['talents'], proudSkillOpens);
		}
	}

	private static initMaterialExcel() {
		const _materials: [
			{
				id: number; stackLimit: number; itemType: string;
				materialType?: string; icon: string;
			}
		] = this.loadResourceFile('MaterialExcelConfigData');

		_materials.forEach((element) => {
			switch (element.itemType) {
				case 'ITEM_MATERIAL':
					if (!element.materialType) {
						break;
					}
			
					if (element.materialType === 'MATERIAL_NAMECARD') {
						this.namecards.push(element.id);
						break;
					}

					if (element.materialType === 'MATERIAL_AVATAR' &&
					element.icon.startsWith('UI_AvatarIcon_') && !element.icon.includes('Play')) {
						this.avatarCards.push(element.id);
					}
				break;
			}
		});
	}

	private static initAvatarExcel() {
		this.avatars = {};
		const avatarExcelConfigData: [] = this.loadResourceFile('AvatarExcelConfigData');

		for (let avatarConfig of avatarExcelConfigData) {
			if (avatarConfig['useType'] === undefined) {
				continue;
			}
		
			if (avatarConfig['useType'] === 'AVATAR_ABANDON' || avatarConfig['useType'] === 'AVATAR_SYNC_TEST') {
				continue;
			}
		
			let depotId = 0;
		
			const candSkillDepotIds: [] = avatarConfig['candSkillDepotIds'];
		
			if (candSkillDepotIds.length != 0) {
				depotId = 704;
			} else {
				depotId = avatarConfig['skillDepotId'];
			}
		
			const proudSkillsKeys: number[] = [];
			const depot = this.depots[depotId];
			const proudSkills = depot.getDefaultProudSkillsMap();

			for (let key in proudSkills) {
				proudSkillsKeys.push(Number(key));
			}

			const fightPropMap: { [key: number]: number } = {};
			fightPropMap[FightProperties.FIGHT_PROP_HP] = avatarConfig["hpBase"];
			fightPropMap[FightProperties.FIGHT_PROP_BASE_HP] = avatarConfig["hpBase"];
			fightPropMap[FightProperties.FIGHT_PROP_BASE_ATTACK] = avatarConfig["attackBase"];
			fightPropMap[FightProperties.FIGHT_PROP_BASE_DEFENSE] = avatarConfig["defenseBase"];
			fightPropMap[FightProperties.FIGHT_PROP_CRITICAL_HURT] = avatarConfig["criticalHurt"];
			fightPropMap[FightProperties.FIGHT_PROP_CRITICAL] = avatarConfig["critical"];
			// base initial hp will be used for max and current hp to fix 0 hp
			fightPropMap[FightProperties.FIGHT_PROP_CUR_HP] = avatarConfig["hpBase"];
			fightPropMap[FightProperties.FIGHT_PROP_MAX_HP] = avatarConfig["hpBase"];
			// base attack will be used for current atk to fix no atk damage
			fightPropMap[FightProperties.FIGHT_PROP_CUR_ATTACK] = avatarConfig["attackBase"];

			const propMap: { [key: number]: number } = {};
			propMap[EntityProperties.PROP_LEVEL] = 1;
			propMap[EntityProperties.PROP_EXP] = 0;
			propMap[EntityProperties.PROP_SATIATION_VAL] = 0;
			propMap[EntityProperties.PROP_SATIATION_PENALTY_TIME] = 0;

			const avatarPropMap: { [key: number]: PropValue } = {};
			for (let val of Object.keys(propMap)) {
				avatarPropMap[Number(val)] = PropValue.create({
					type: Number(val), val: BigInt(propMap[Number(val)]), 
					value: { oneofKind: "ival", ival: BigInt(propMap[Number(val)]) }
				});
			}

			const avatar = AvatarInfo.create({
				avatarId: avatarConfig['id'],
				avatarType: 1,
				bornTime: Math.round(Date.now() / 1000),
				skillDepotId: depotId,
				talentIdList: depot.talentIds,
				propMap: avatarPropMap,
				fightPropMap: fightPropMap,
				fetterInfo: { expLevel: 1 },
				equipGuidList: [],
				inherentProudSkillList: proudSkillsKeys,
				skillLevelMap: depot.getDefaultSkillMap(),
				proudSkillExtraLevelMap: depot.getDefaultProudSkillsMap(),
				wearingFlycloakId: 140010,
				lifeState: 1,
				coreProudSkillLevel: 0
			});

			this.avatars[avatarConfig['id']] = { weaponType: avatarConfig["weaponType"], avatarInfo: avatar };
			//@ts-ignore
			this.idTranslate[avatarConfig['id']] = avatarConfig['iconName'].split('UI_AvatarIcon_')[1];
		}
	}

	private static initChatEmojiExcel() {
		const _emojis: [{ id: number }] = this.loadResourceFile('EmojiDataExcelConfigData');
		_emojis.forEach((element) => this.emojis.push(element.id));
	}

	private static initWeaponExcel() {
		const _weapons: WeaponExcel[] = this.loadResourceFile('WeaponExcelConfigData');
		_weapons.forEach((weapon) => this.weaponExcels.set(weapon.id, weapon));
	}

	private static initGadgets() {
		const gadgets: [] = this.loadResourceFile('GadgetExcelConfigData');
	  
		for (let gadget of gadgets) {
			this.gadgets[gadget['id']] = gadget['jsonName'];
		}
	}
	
	private static initShopExcelConfigData() {
		const _shops: [{ shopId: number; shopType: string }] = this.loadResourceFile('ShopExcelConfigData');

		_shops.forEach((element) => {
			if (element.shopType === 'SHOP_TYPE_PAIMON') {
				this.shopMalls.push(element.shopId);
			}
		});
	}

	public static getEmbryoFromId(id: number): AbilityEmbryo[] {
		return this.embryos[this.idTranslate[id]];
	}
	  
	public static getGadgetByName(id: number): string {
		return this.gadgets[id];
	}
}

enum ResourceType {
	MonsterBinOutput,
	ExcelBinOutput,
	BinOutput,
	AvatarBinOutput
}