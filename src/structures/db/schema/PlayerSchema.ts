// import mongoose from "mongoose";
// import Utils from "../../utils/Utils";

// export const model = new mongoose.Schema({
//       open_id: String,
//       nickname: String,
// 	signature: String,
// 	profilePicture: {
// 		avatarId: Number,
// 		costumeId: Number
// 	},
// 	props: Object,
// 	registrationDate: String,
// 	nameCardId: Number,
// 	travelerId: Number,
// 	birthday: {
// 		month: Number, day: Number 
// 	}
// });

// const playerModel = mongoose.model("player", model);

// export class PlayerSchema {
// 	static async fromUID(uid: string) {
// 		const player = await playerModel.findOne({ open_id: uid });
// 		if (!player) return null;
// 		return player;
// 	}

// 	static async create(uid: string, nickName: string, avatarId: number) {
// 		let player = await playerModel.findOne({ open_id: uid });
// 		if (player) return player;

// 		player = await playerModel.create({
// 			open_id: uid,
// 			nickname: nickName,
// 			signature: "",
// 			profilePicture: {
// 				avatarId, costumeId: 0
// 			},
// 			registrationDate: Date.now().toString(),
// 			nameCardId: 210001,
// 			travelerId: avatarId
// 		});
// 		player.save();

// 		return player;
// 	}

// 	static async update(uid: string, updateData: any) {
// 		const player = await playerModel.findOne({ open_id: uid });
// 		if (!player) return false;

// 		// @ts-ignore
// 		await player.update(updateData);
// 		await player.save();
// 		return true;
// 	}
// }