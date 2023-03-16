# dispatch
A small script to dispatch available gameservers to connect to.

> **Warning**

> ***This project is not marked as production-ready and may break at any time.*** \
> Please use a [VPN](https://en.wikipedia.org/wiki/Virtual_private_network) or a [Virtual Machine](https://en.wikipedia.org/wiki/Virtual_machine) while you test this project as you may risk getting banned while testing this project that is still in the works.

## Modules used
- [Chalk](https://npmjs.com/package/chalk) - A beautiful color logging dependency. Makes crash and exit logs look good.
- [Fastify](https://www.fastify.io/) - HTTP(s) server. Handles every requests the game makes (For account authentication, gateway information for server connectivity and game server states, spider and crash logging, etc.)

## How to set up
(Assuming that you already have installed ts-node-dev globally via npm and Fiddler/mitmproxy/hosts set up)

1. Clone the Github Repository via Git Bash

```powershell
git clone https://github.com/LoonaPS/dispatch.git
```

2. Extract and open the repository in the Terminal

```powershell
# Assuming that you are in Windows/Linux
cd dispatch
```

3. Fix the configuration files.
- Game servers are very important to set up, make sure you haven't left that out yet. Just enter the connection credentials to your self-hosted game servers in the `config.json` file.

```powershell
npm install --save-dev
npm run start
```