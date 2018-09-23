const fs = require("fs").promises;
const path = require("path");

const noop = () => {};

async function isDir(dir) {
	let stats = await fs.stat(dir);

	return stats && stats.isDirectory();
}

async function walkDirectory(dir, callback = noop) {
	let files = await fs.readdir(dir);

	await files.reduce(async (promise, file) => {
		let filePath = path.resolve(dir, file);

		await promise;

		if (await isDir(filePath)) {
			await walkDirectory(filePath, callback);
		} else {
			await callback(dir, path.basename(filePath));
		}
	});
}

module.exports = {
	walkDirectory,
	isDir
};
