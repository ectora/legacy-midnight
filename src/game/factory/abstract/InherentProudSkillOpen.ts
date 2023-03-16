export class InherentProudSkillOpen {
	public proudSkillGroupId;
	public needAvatarPromoteLevel;
	public static proudSkillExtraMap: { [key: number]: number } = [];
    
	constructor(proudSkillGroupId: number, needAvatarPromoteLevel: number) {
		this.proudSkillGroupId = proudSkillGroupId;
		this.needAvatarPromoteLevel = needAvatarPromoteLevel;
	}
}