# legacy-midnight
Legacy code for MidnightTS. Due to MidnightTS dying due to lack of maintenance and unwilling to sustain changes, the code author has decided to put things to an end took a mental health break and decided to archive the codebase.

| subprojects |  reason why it existed |
|-------------|------------------------|
|    dbgate   | The reason why I had to separate the database from the dispatch and gameserver is to change and switch different database wrappers and make it connect to a WebSocket server. I don't know what got into me and made me make this change happen |
|  dispatch   | The final revision that was done in this subproject is to migrate database wrappers due to mongoose being an ass for mutilating the data and removing useful parameters from the loaded save data and separation of account system to the gateserver which was never released. Kinda sad, but it was fun while it lasted. |
| gameserver  | The final revision that was done in this subproject is to migrate database wrappers due to mongoose being an ass for mutilating the data and removing useful parameters from the loaded save data. Kinda sad, but it was fun while it lasted. |
| gateserver  | This is where I make a gateserver, but I never completed it because TypeScript is fuckening my brain because of errors.  |

### maintainer's message
> The reason why I separated the codebase into different repositories is I don't know, I was planning to recreate a 1:1 server with just TypeScript and all.

RIP MidnightTS - 2021-2022.
