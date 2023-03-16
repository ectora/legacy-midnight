import mongoose from "mongoose";

export const Account = new mongoose.Schema({
      open_id: String,
      username: String,
      email: {
            content: String,
            verified: Boolean
      },
      token: String,
      devices: [
            {
                  endpoint: String,
                  deviceId: String,
                  timeToLive: Number,
                  sessionKey: String
            }
      ],
      permissions: { type: Array, default: [''] }
});

const accountModel = mongoose.model("account", Account);

export class AccountSchema {
      static async fromIdentifier(identifier: string) {
            const account = await accountModel.findOne({ username: identifier });
            if (!account) return null;
            else return account;
      }

      static async fromUID(uid: string) {
            const account = await accountModel.findOne({ open_id: uid });
            if (!account) return null;
            return account;
      }

      static async fromToken(token: string) {
            const account = await accountModel.find({ "devices.sessionKey": token });
            if (!account) return null;
            return account;
      }
}