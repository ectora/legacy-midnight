import { Vector } from "bazal";

export enum ClimateType {
	CLIMATE_NONE = 0,
	CLIMATE_SUNNY = 1,
	CLIMATE_CLOUDY = 2,
	CLIMATE_RAIN = 3,
	CLIMATE_THUNDERSTORM = 4,
	CLIMATE_SNOW = 5,
	CLIMATE_MIST = 6
}

export type WeaponType = "WEAPON_CATALYST" | "WEAPON_CLAYMORE" | "WEAPON_POLE" | "WEAPON_BOW" | "WEAPON_SWORD_ONE_HAND";

export class GameConstants {
	public static MAIN_CHARACTER_MALE = 10000005;
	public static MAIN_CHARACTER_FEMALE = 10000007;

	public static START_POSITION: Vector = Vector.create({
		x: 2747,
		y: 194,
		z: -1719,
	});

	public static SERVER_CONSOLE_UID = 1;

	public static DEFAULT_ABILITY_STRINGS = [
		'Avatar_DefaultAbility_VisionReplaceDieInvincible',
		'Avatar_DefaultAbility_AvartarInShaderChange',
		'Avatar_SprintBS_Invincible',
		'Avatar_Freeze_Duration_Reducer',
		'Avatar_Attack_ReviveEnergy',
		'Avatar_Component_Initializer',
		'Avatar_FallAnthem_Achievement_Listener',
	];

	public static DEFAULT_ABILITY_NAME = 'Default';
}