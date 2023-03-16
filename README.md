# dbgate
Abstraction of permanent (MongoDB) and temporary (Redis) database.

## Modules used
- [Chalk](https://npmjs.com/package/chalk) - A beautiful color logging dependency. Makes crash and exit logs look good.
- [Prisma](https://prisma.io) - A next-generation Node.js and TypeScript ORM for PostgreSQL, MySQL, SQL Server, SQLite, MongoDB, and CockroachDB. Used for storing account data and short-lived authentication keys.

### what does it do?
Runs a WebSocket and HTTP server for endpoints to connect and make database related queries with it.
The HTTP server acts as a status page for dbgate and handles WebSocket connections.
⠀
### how does it work?
When an endpoint connects to the WebSocket gateway, it must send a header with the authorization password and send a `InitializeConnectionReq` query (to determine which type of service is the one connecting) or else the connection gets terminated.

The WebSocket connection headers should look something like this:
```js
headers: {
	"Authorization": "youshallnotpass",
	"X-Extra-Headers-You-Want": "example_headers"
}
```

It lets the endpoint client send any supported packets to get expecting message replies. Unless an unknown command is sent will produce a `CommandExceptionNotify` packet. Make sure to handle `ServiceHeartBeatNotify` (sent periodically by the gateway to keep the connection between the peer client alive.) as the WebSocket gateway doesn't tolerate dropped heartbeats (5 max dropped heartbeat) and may disconnect the peer client.

### how do you set it up?
1. Clone the Github Repository via Git Bash

```powershell
git clone https://github.com/YonakaPS/dbgate.git
```

2. Extract and open the repository in the Terminal

```powershell
# Assuming that you are in Windows/Linux
cd dbgate
```

3. Fix the configuration files.
- Assuming that you're going to be using MongoDB Atlas as a database source, just change the default database URI from the `.env.example` file with your own database URL. Rename `.env.example` to `.env` after doing so.
	- (For the time being, MongoDB Server Standalones aren't working with Prisma as it uses a MongoDB database with **replica sets** to record data manipulation into small transactions that can be reversed if the query either fails.)

- An authentication password is important to make sure your dbgate instance is secure and restricted to endpoints who has the password, make sure you haven't left that out yet. Just enter the password you want to use in the generated `config.json` file.

4. Install dependencies and load the database schemas into your own database.
- Prisma will perform schema compilation and will create indexes to your MongoDB database.

```powershell
npm install --save-dev
npm run generateSchema
```

```powershell
npm run start
```