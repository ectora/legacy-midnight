import { InherentProudSkillOpen } from "./InherentProudSkillOpen";

export class AvatarDepot {
	public skillMap: number[];
	public subSkillMap: number[];
	public talentIds: number[];
	public inherentProudSkillOpens: InherentProudSkillOpen[];
    
	constructor(
		skillMap: number[],
		subSkillMap: number[],
		talentIds: number[],
		inherentProudSkillOpens: InherentProudSkillOpen[]
	) {
		this.inherentProudSkillOpens = inherentProudSkillOpens;
		this.skillMap = skillMap;
		this.subSkillMap = subSkillMap;
		this.talentIds = talentIds;
	}
    
	getDefaultSkillMap() {
		const skills: { [key: number]: number } = [];
		this.skillMap.forEach((e) => {
			skills[e] = 1;
		});
		// this.subSkillMap.forEach((e) => {
		//   skills[e] = 1;
		// });
		return skills;
	}
    
	getDefaultProudSkillsMap() {
		const map: { [key: number]: number } = [];
	
		this.skillMap.forEach((e) => {
			map[InherentProudSkillOpen.proudSkillExtraMap[e]] = 3;
		});
	
		return map;
	}
}