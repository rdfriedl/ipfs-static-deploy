const { Command, flags } = require("@oclif/command");
const path = require("path");
const ipfsApi = require("ipfs-api");
const chalk = require("chalk");

const customFlags = require("../flags");
const createUtils = require("../utils/ipfs");
const { walkDirectory } = require("../utils/fs");

class DeployCommand extends Command {
	async run() {
		const { flags } = this.parse(DeployCommand);

		const ipfs = ipfsApi(flags.host);
		const utils = createUtils(ipfs);

		const deployDate = new Date().toISOString();
		const deployPath = path.resolve("/", flags.path);
		const uploadFolder = path.resolve(deployPath, "latest");
		const sourcePath = path.resolve(flags.source);
		const versionsFile = path.resolve(deployPath, flags.versions);

		// re-create upload folder
		await utils.mkdirp(uploadFolder);

		let { hash: currentHash } = await ipfs.files.stat(uploadFolder, {
			hash: true
		});

		// write files
		await walkDirectory(sourcePath, async (dir, file) => {
			let input = path.resolve(dir, file);
			let outputFolder = path.resolve(
				uploadFolder,
				path.relative(sourcePath, dir)
			);
			let output = path.resolve(outputFolder, file);

			if (flags.debug) {
				console.log(chalk.gray("input:", input));
				console.log(chalk.gray("output:", output));
			}

			try {
				await utils.mkdirp(outputFolder);
				await utils.writeFile(output, input);

				console.log(chalk.cyan(path.relative(sourcePath, input), "->", output));
			} catch (err) {
				console.log(chalk.red("Failed to write", output));

				if (flags.debug) console.log(chalk.red(err.stack));
				else console.log(chalk.red(err.message));
			}
		});

		await ipfs.files.flush(deployPath);

		// get new hash
		let { hash: newHash } = await ipfs.files.stat(uploadFolder, { hash: true });

		if (currentHash !== newHash) {
			// make a copy, and label it with the current date
			let versionFolder = path.resolve(deployPath, deployDate);
			await ipfs.files.cp(uploadFolder, versionFolder);

			// update the versions file
			try {
				let versions = await utils.getVersions(versionsFile);

				versions.push({
					date: deployDate,
					hash: newHash
				});

				await utils.writeFile(
					versionsFile,
					Buffer.from(JSON.stringify(versions, null, 2))
				);
			} catch (err) {
				console.log(chalk.red("Failed to update versions file"));

				if (flags.debug) console.log(chalk.red(err.stack));
				else console.log(chalk.red(err.message));
			}

			console.log(
				chalk.green("Deployed to", `https://ipfs.io/ipfs/${newHash}`)
			);
		} else {
			console.log(
				chalk.yellow("Nothing Changed", `https://ipfs.io/ipfs/${newHash}`)
			);
		}
	}
}

DeployCommand.description = `Deploys the files in <source> to the path on ipfs`;

DeployCommand.flags = {
	host: customFlags.host,
	source: flags.string({
		char: "i",
		description: "The source path",
		env: "IPFS_SOURCE",
		required: true
	}),
	path: customFlags.path,
	versions: customFlags.versions,
	debug: customFlags.debug
};

module.exports = DeployCommand;
