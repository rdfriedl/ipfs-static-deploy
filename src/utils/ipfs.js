module.exports = ipfs => {
	function writeFile(path, content, opts = {}) {
		return ipfs.files.write(path, content, {
			create: true,
			parents: true,
			flush: false,
			...opts
		});
	}

	function mkdirp(path, opts = {}) {
		return ipfs.files.mkdir(path, {
			parents: true,
			flush: false,
			...opts
		});
	}

	function getVersions(versionsFile) {
		return readJsonFile(versionsFile)
			.then(versions => versions || [])
			.catch(() => []);
	}

	function readFile(path, encoding = "utf8") {
		return new Promise((resolve, reject) => {
			const stream = ipfs.files.readReadableStream(path);

			stream.on("data", buf => resolve(buf.toString(encoding)));
			stream.on("error", err => reject(err));
		});
	}

	async function readJsonFile(path) {
		return readFile(path).then(raw => JSON.parse(raw));
	}

	return {
		writeFile,
		mkdirp,
		getVersions,
		readFile,
		readJsonFile
	};
};
