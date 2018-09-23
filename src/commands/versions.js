const { Command, flags } = require("@oclif/command");
const path = require("path");
const ipfsApi = require("ipfs-api");
const chalk = require("chalk");

const customFlags = require("../flags");
const createUtils = require("../utils/ipfs");

class VersionsCommand extends Command {
	async run() {
		const { flags } = this.parse(VersionsCommand);

		const ipfs = ipfsApi(flags.host);
		const utils = createUtils(ipfs);

		const deployPath = path.resolve("/", flags.path);
		const versionsFile = path.resolve(deployPath, flags.versions);

		let versions = await utils.getVersions(versionsFile);

		if (flags.json) {
			console.log(JSON.stringify(versions, null, 2));
		} else if (versions.length) {
			let table = versions.map(version => ({
				url: `https://ipfs.io/ipfs/${version.hash}`,
				date: new Date(version.date).toLocaleDateString(),
				hash: version.hash
			}));

			console.table(table, ["date", "hash", "url"]);
		} else {
			console.log(chalk.yellow("No versions"));
		}
	}
}

VersionsCommand.description = `Deploys the files in <source> to the destination path on ipfs`;

VersionsCommand.flags = {
	host: customFlags.host,
	path: customFlags.path,
	versions: customFlags.versions,
	debug: customFlags.debug,
	json: flags.boolean({
		description: "output json"
	})
};

module.exports = VersionsCommand;
