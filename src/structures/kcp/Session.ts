import { DataPacket } from "./DataPacket";
import { KcpConnection } from "./KcpConnection";
import Logger from "../utils/Logger";

import { CmdId, CmdIdAndName, PacketName } from "../packets/PacketOpcodes";
import { PacketHead, PlayerLogoutNotify, Retcode } from 'bazal';
import { World } from "../../game/abstract/World";
import { Player } from "../../game/abstract/Player";

const loopPackets: string[] = [
	'PingReq', 'PingRsp','UnlockNameCardNotify','EvtDoSkillSuccNotify','UnionCmdNotify', 'WorldPlayerRTTNotify',
	'AbilityInvocationsNotify', 'CombatInvocationsNotify'
];

export class Session {
	connection: KcpConnection;

	private world: World;
	private player: Player;
	public uid: number = 0;
	public sceneToken: number = 0;
	public isPaused: boolean = false;

	constructor(connection: KcpConnection) {
		this.connection = connection;
		this.world = new World(this);
		this.player = new Player(this);
	}

	async send(type: PacketName, data: Buffer, recvMs: bigint) {
		const header = PacketHead.create({
			recvTimeMs: recvMs,
			sentMs: BigInt(Date.now()),
			clientSequenceId: ++this.connection.manager.server.clientSequence,
			extMap: {},
			serviceAppIdMap: {}
		});

		// recvTimeMs: BigInt(Date.now() / 1000),

		const packetId = CmdId[type];
		const packet = new DataPacket(packetId, Buffer.from(PacketHead.toBinary(header)), Buffer.from(data));

		if (!loopPackets.includes(type)) {
			Logger.debug(`Sent : ${type} (${packetId})`);
		}

		this.connection.send(packet);
		this.connection.flush();
	}

	public getWorld() {
		return this.world;
	}

	public getPlayer() {
		return this.player;
	}

	handle(packet: DataPacket, recv: bigint) {
		const packetName = CmdIdAndName[packet.id.toString() as keyof typeof CmdIdAndName];

		if (!loopPackets.includes(packetName)) {
			Logger.info(`Recv : ${packetName} (${packet.id})`);
		}

		const packetHandler = this.connection.manager.server.getPacketHandler();
		// @ts-ignore: Argument of type 'string' is not assignable to parameter of type PacketName.
		packetHandler.core.emit(packetName, this, packet, recv);

		// import(`../packets/recv/${packetName}`)
		// 	.then(async (mod) => {
		// 		await mod.default(this, packet, recv);
		// 	})
		// 	.catch(async (e) => {
		// 		if (e.code === 'MODULE_NOT_FOUND')
		// 			// return;
		// 			Logger.warn(`Unhandled packet: ${packetName}`);
		// 		else Logger.error(e);

		// 		await defaultHandler(this, packet);
		// 	});

		return;
	}

	notifyStopServer() {
		const buffer = Buffer.from(PlayerLogoutNotify.toBinary({ retcode: Retcode.RET_STOP_SERVER }));
		this.send("PlayerLogoutNotify", buffer, BigInt(Date.now()));
	}

	anotherSession() {
		const buffer = Buffer.from(PlayerLogoutNotify.toBinary({ retcode: Retcode.RET_ANOTHER_LOGIN }));
		this.send("PlayerLogoutNotify", buffer, BigInt(Date.now()));
	}

	close() {
		const buffer = new DataPacket(CmdId.ServerDisconnectClientNotify, Buffer.alloc(0), Buffer.alloc(0)).encode()
		this.connection.sendRaw(buffer);
	}

	kick() {
		const buffer = new DataPacket(CmdId.ServerDisconnectClientNotify, Buffer.alloc(0), Buffer.alloc(0)).encode()
		this.connection.sendRaw(buffer);
	}
}