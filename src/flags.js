const { flags } = require("@oclif/command");

const host = flags.string({
	char: "h",
	description: "the address of the ipfs api",
	required: true,
	env: "IPFS_ADDRESS",
	default: "localhost:8080"
});
const path = flags.string({
	char: "p",
	description: "the deploy path of the application",
	env: "IPFS_PATH",
	required: true
});
const versions = flags.string({
	char: "v",
	description: "the name to use for the versions file",
	env: "IPFS_VERSION_FILE",
	default: "versions.json"
});
const debug = flags.boolean({
	description: "enable debugging"
});

module.exports = {
	host,
	path,
	versions,
	debug
};
