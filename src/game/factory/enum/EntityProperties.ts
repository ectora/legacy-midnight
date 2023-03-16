import { PropPair, PropValue } from "bazal";

export enum EntityProperties {
	PROP_EXP = 1001,
	PROP_BREAK_LEVEL = 1002,
	PROP_SATIATION_VAL = 1003,
	PROP_SATIATION_PENALTY_TIME = 1004,
	PROP_LEVEL = 4001,
}
    
export class EntityProperty {
	private static entityProp: { [type: number]: PropValue } = {};
	private static entityPropPair: PropPair[] = [];
    
	public static init() {
		this.entityProp[EntityProperties.PROP_LEVEL] = PropValue.create({
			val: BigInt(90),
			value: { oneofKind: "ival", ival: BigInt(90) },
			type: EntityProperties.PROP_LEVEL
		});

		this.entityProp[EntityProperties.PROP_EXP] = PropValue.create({
			val: BigInt(0),
			value: { oneofKind: "ival", ival: BigInt(0) },
			type: EntityProperties.PROP_EXP
		});

		this.entityProp[EntityProperties.PROP_BREAK_LEVEL] = PropValue.create({
			val: BigInt(6),
			value: { oneofKind: "ival", ival: BigInt(6) },
			type: EntityProperties.PROP_BREAK_LEVEL
		});

		this.entityProp[EntityProperties.PROP_SATIATION_PENALTY_TIME] =
			PropValue.create({ val: BigInt(0), value: { oneofKind: "ival", ival: BigInt(0) }, type: EntityProperties.PROP_SATIATION_PENALTY_TIME});
		this.entityProp[EntityProperties.PROP_SATIATION_VAL] =
			PropValue.create({ val: BigInt(0), value: { oneofKind: "ival", ival: BigInt(0) }, type: EntityProperties.PROP_SATIATION_VAL});
	
		for (let val of Object.keys(this.entityProp)) {
			this.entityPropPair.push(PropPair.create({ type: Number(val), propValue: this.entityProp[Number(val)] }));
		}
	}
    
	public static getEntityProp() {
		return this.entityProp;
	}
    
	public static getEntityPropPair() {
		return this.entityPropPair;
	}
}