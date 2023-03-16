const fs = require("fs");
const path = require("path");
const CmdId = fs.readFileSync(path.resolve(process.cwd(), "./cmdid.csv")).toString("binary");

function splitCmdNameFromId(cmdidToExtract) {
	const cmdids = cmdidToExtract.split("\n");
	const extractedCmdId = {};

	for (const cmdid of cmdids) {
		const cmdname = cmdid.split(/,/g)[0];
		const cmdnum = cmdid.split(/,/g)[1];

		extractedCmdId[cmdname] = parseInt(cmdnum);
	}

	fs.writeFileSync(path.resolve(process.cwd(), "./cmdid.json"), JSON.stringify(extractedCmdId, null, "\t"));
}

function splitCmdIdFromName(cmdidToExtract) {
	const cmdids = cmdidToExtract.split("\n");
	const extractedCmdId = {};

	for (const cmdid of cmdids) {
		const cmdname = cmdid.split(/,/g)[0];
		const cmdnum = cmdid.split(/,/g)[1];

		extractedCmdId[cmdnum] = cmdname;
	}

	fs.writeFileSync(path.resolve(process.cwd(), "./cmdname.json"), JSON.stringify(extractedCmdId, null, "\t"));
}

splitCmdNameFromId(CmdId);
splitCmdIdFromName(CmdId);