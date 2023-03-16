# gameserver
A small script to run a game server for players to play in.

> **Warning**

> Please use a [VPN](https://en.wikipedia.org/wiki/Virtual_private_network) or a [Virtual Machine](https://en.wikipedia.org/wiki/Virtual_machine) while you test this project as you may risk getting banned while testing this project that is still in the works.

## Modules used
- [Chalk](https://npmjs.com/package/chalk) - A beautiful color logging dependency. Makes crash and exit logs look good.
- [protobufjs](https://npmjs.com/package/protobufjs) - Used for serializing and deserializing data sent from the client to the server and vice versa.
- [kcp-ts](https://github.com/timing1337/kcp-ts) - A fast and reliable ARQ protocol used for minimizing bandwidth wasteage. A fork of [the original](https://npmjs.com/package/node-kcp) one made to support this game.
- [denque](https://npmjs.com/package/denque) - An extremely fast and lightweight double-ended queue implementation. Used for queueing packets to send to the upstream clients.

## How to set up
(Assuming that you already have installed ts-node-dev globally via npm, Fiddler/mitmproxy/hosts set up, and [dispatch](https://github.com/MidnightTS/dispatch) configured.)

1. Clone the Github Repository via Git Bash

```powershell
git clone https://github.com/MidnightTS/gameserver.git
```

2. Extract and open the repository in the Terminal

```powershell
# Assuming that you are in Windows/Linux
cd gameserver
```

3. Fix the configuration files.
- Assuming that you're going to be using MongoDB Atlas as a database source, just change the default database URI from the `config.ts` file with your own database URL. **The database URL of the gameserver must be equal to the dispatch or else signing into the server would be a pain.**
- Add a copy of your server-side game server resources to be provided to the client. Visit this [Discord Server](https://discord.gg/grasscutter) to obtain the resources required by the game server.

4. Install

```powershell
npm install --save-dev
```

```powershell
npm run start
```