import { DataProperties } from "./DataProperties";
import { FightProperties } from "./FightProperties";
import { WeaponType } from "./GameConstants";

export type MonsterHPDrop = {
	dropId: number;
	hpPercent: number;
};

export type MonsterSecurityLevel = "ELITE" | "BOSS";

export type WeaponProp = {
	propType: keyof typeof FightProperties,
	initValue: number,
	type: string
};

export type WeaponExcel = {
	weaponType: WeaponType,
	rankLevel: number,
	weaponBaseExp: number,
	skillAffix: number[],
	weaponProp: WeaponProp[],
	awakenTexture: string,
	awakenLightMapTexture: string,
	awakenIcon: string,
	weaponPromoteId: number,
	storyId: number,
	awakenCosts: [],
	gachaCardNameHashSuffix: number,
	destroyRule: string,
	destroyReturnMaterial: number[],
	destroyReturnMaterialCount: number[],
	id: number,
	nameTextMapHash: number,
	descTextMapHash: number,
	icon: string,
	itemType: string,
	weight: number,
	rank: number,
	gadgetId: number,
};

export type MonsterExcel = {
	securityLevel?: MonsterSecurityLevel;
	monsterName: string,
	type: string,
	scriptDataPathHashSuffix: number,
	serverScript: string,
	combatConfigHashSuffix: number,
	affix: number[],
	ai: string,
	isAIHashCheck: boolean,
	equips: number[],
	hpDrops: MonsterHPDrop[],
	killDropId: number,
	excludeWeathers: string,
	featureTagGroupID: number,
	mpPropID: number,
	skin: string,
	describeId: number,
	combatBGMLevel: number,
	entityBudgetLevel: number,
	hpBase: number,
	attackBase: number,
	defenseBase: number,
	fireSubHurt: number,
	grassSubHurt: number,
	waterSubHurt: number,
	elecSubHurt: number,
	windSubHurt: number,
	iceSubHurt: number,
	rockSubHurt: number,
	propGrowCurves: object,
	physicalSubHurt: number,
	prefabPathRagdollHashSuffix: number,
	animatorConfigPathHashPre: number,
	id: number,
	nameTextMapHash: number,
	prefabPathHashSuffix: number,
	controllerPathHashPre: number,
	controllerPathRemoteHashSuffix: number,
	controllerPathRemoteHashPre: number,
	campID: number,
	LODPatternName: string
}

export const getPropTypeFromItemId = (itemId: number): DataProperties | undefined => {
	const itemIds = {
		"102": DataProperties.PROP_PLAYER_EXP,
		"106": DataProperties.PROP_PLAYER_RESIN,
		"107": DataProperties.PROP_PLAYER_LEGENDARY_KEY,
		"201": DataProperties.PROP_PLAYER_HCOIN,
		"202": DataProperties.PROP_PLAYER_MCOIN,
		"203": DataProperties.PROP_PLAYER_SCOIN,
	};

	// @ts-ignore
	return itemIds[itemId.toString()];
}