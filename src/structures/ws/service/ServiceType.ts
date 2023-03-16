export enum ServiceType {
	SERVICE_TYPE_NONE = 0,
	SERVICE_TYPE_CLIENT = 1,
	SERVICE_TYPE_GATE = 2,
	SERVICE_TYPE_GAME = 3,
	SERVICE_TYPE_NODE = 4,
	SERVICE_TYPE_DB = 5,
	SERVICE_TYPE_SNS = 6,
	SERVICE_TYPE_DISPATCH = 7,
	SERVICE_TYPE_MUIP = 8,
	SERVICE_TYPE_OFFLINE_MSG = 9,
	SERVICE_TYPE_MAIL = 10,
	SERVICE_TYPE_MP = 11,
	SERVICE_TYPE_HTTPPROXY = 12,
	SERVICE_TYPE_ACTIVITY = 13,
	SERVICE_TYPE_PATHFINDING = 14,
	SERVICE_TYPE_SOCIAL = 15,
	SERVICE_TYPE_OA = 16,
	SERVICE_TYPE_MATCH = 17,
	SERVICE_TYPE_OFFLINE_OP = 18,
	SERVICE_TYPE_TOTHEMOON = 19,
	SERVICE_TYPE_GCG = 20
}

export type ServiceEnum = keyof typeof ServiceType;