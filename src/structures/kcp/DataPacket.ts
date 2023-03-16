import { PacketHead } from 'bazal';

const MAGIC_START = 0x4567; //0x4567  = GI SR = 0x01234567
const MAGIC_END = 0x89ab; // 0x89ab = GI SR = 0x89abcdef

export class DataPacket {
      static readonly minimumSize = 12;

      constructor(readonly id: number, readonly metadata: Buffer, readonly data: Buffer) {}

      static decode(buffer: Buffer) {
            if (buffer.length < DataPacket.minimumSize) {
                  return false;
            }

            const start = buffer.readUInt16BE();
            const id = buffer.readUInt16BE(2);
            const metadataSize = buffer.readUInt16BE(4);
            const dataSize = buffer.readUInt32BE(6);

            if (buffer.length !== DataPacket.minimumSize + metadataSize + dataSize) {
                  return false;
            }

            const metadata = buffer.slice(10, 10 + metadataSize);
            const data = buffer.slice(10 + metadataSize, 10 + metadataSize + dataSize);
            const end = buffer.readUInt16BE(10 + metadataSize + dataSize);

            switch (true) {
                  case start === MAGIC_START && end === MAGIC_END:
                        return new DataPacket(id, metadata, data);

                  default:
                        return false;
            }
      }

      encode() {
            // @ts-ignore
            const packetHead = PacketHead.create({ recvTimeMs: BigInt(Date.now()) })
            const new_metadata = Buffer.from(PacketHead.toBinary(packetHead));

            const magic2 = Buffer.from(0x89AB.toString(16), 'hex')
            const part1 = Buffer.alloc(10)

            part1.writeUInt16BE(0x4567, 0)
            part1.writeUInt16BE(this.id, 2)
            part1.writeUInt16BE(new_metadata.length, 4)
            part1.writeUInt32BE(this.data.length, 6)

            const ret = Buffer.concat([part1, new_metadata, this.data, magic2], part1.length + new_metadata.length + this.data.length + magic2.length)

            return ret;
      }
}