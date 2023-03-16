export enum ServiceCommandEnum {
	// server diagnostic commands
	GetDbGateOperationalDataReq = 10000,
	GetDbGateOperationalDataRsp = 10001,
	// server statistical commands
	InitializeConnectionReq = 10002,
	InitializeConnectionRsp = 10003,

	ServicePingAckReq = 10004,
	ServicePingAckRsp = 10005,
	ServiceHeartBeatNotify = 10006,
  
	// database model operations
	GetSessionDataReq = 10045,
	GetSessionDataRsp = 10046,
	UpdateSessionDataReq = 10047,
	UpdateSessionDataRsp = 10048,

	GetAccountDataReq = 10050,
	GetAccountDataRsp = 10051,
	UpdateAccountDataReq = 10052,
	UpdateAccountDataRsp = 10053,

	GetPlayerDataReq = 10055,
	GetPlayerDataRsp = 10056,
	UpdatePlayerDataReq = 10057,
	UpdatePlayerDataRsp = 10058,

	GetPlayerMailCollectionReq = 10060,
	GetPlayerMailCollectionRsp = 10061,
	UpdatePlayerMailCollectionReq = 10062,
	UpdatePlayerMailCollectionRsp = 10063,

	GetPlayerAvatarCollectionReq = 10065,
	GetPlayerAvatarCollectionRsp = 10066,
	UpdateAvatarDataCollectionReq = 10067,
	UpdateAvatarDataCollectionRsp = 10068,

	// server notifications
	CommandExceptionNotify = 10100
}

export type ServiceCommandType = keyof typeof ServiceCommandEnum;