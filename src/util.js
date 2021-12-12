const path = require("path")
const { mkdirs } = require("fs-extra")
const fs = require("fs")
// const exec = require('util').promisify(require('child_process').exec)


const NonError = class extends Error {
	constructor(message) {
		super(NonError._prepareSuperMessage(message));

		Object.defineProperty(this, 'name', {
			value: 'NonError',
			configurable: true,
			writable: true,
		});

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NonError);
		}
	}

	static _prepareSuperMessage(message) {
		try {
			return JSON.stringify(message);
		} catch {
			return String(message);
		}
	}
}

const commonProperties = [
	{
		property: 'name',
		enumerable: false,
	},
	{
		property: 'message',
		enumerable: false,
	},
	{
		property: 'stack',
		enumerable: false,
	},
	{
		property: 'code',
		enumerable: true,
	},
];

const toJsonWasCalled = Symbol('.toJSON was called');

const toJSON = from => {
	from[toJsonWasCalled] = true;
	const json = from.toJSON();
	delete from[toJsonWasCalled];
	return json;
};

const destroyCircular = ({
	from,
	seen,
	to_,
	forceEnumerable,
	maxDepth,
	depth,
}) => {
	const to = to_ || (Array.isArray(from) ? [] : {});

	seen.push(from);

	if (depth >= maxDepth) {
		return to;
	}

	if (typeof from.toJSON === 'function' && from[toJsonWasCalled] !== true) {
		return toJSON(from);
	}

	for (const [key, value] of Object.entries(from)) {
		// eslint-disable-next-line node/prefer-global/buffer
		if (typeof Buffer === 'function' && Buffer.isBuffer(value)) {
			to[key] = '[object Buffer]';
			continue;
		}

		if (typeof value === 'function') {
			continue;
		}

		if (!value || typeof value !== 'object') {
			to[key] = value;
			continue;
		}

		if (!seen.includes(from[key])) {
			depth++;

			to[key] = destroyCircular({
				from: from[key],
				seen: [...seen],
				forceEnumerable,
				maxDepth,
				depth,
			});
			continue;
		}

		to[key] = '[Circular]';
	}

	for (const {property, enumerable} of commonProperties) {
		if (typeof from[property] === 'string') {
			Object.defineProperty(to, property, {
				value: from[property],
				enumerable: forceEnumerable ? true : enumerable,
				configurable: true,
				writable: true,
			});
		}
	}

	return to;
};

const serializeError = function (value, options = {}) {
	const {maxDepth = Number.POSITIVE_INFINITY} = options;

	if (typeof value === 'object' && value !== null) {
		return destroyCircular({
			from: value,
			seen: [],
			forceEnumerable: true,
			maxDepth,
			depth: 0,
		});
	}

	// People sometimes throw things besides Error objects…
	if (typeof value === 'function') {
		// `JSON.stringify()` discards functions. We do too, unless a function is thrown directly.
		return `[Function: ${(value.name || 'anonymous')}]`;
	}

	return value;
}

const deserializeError = function deserializeError(value, options = {}) {
	const {maxDepth = Number.POSITIVE_INFINITY} = options;

	if (value instanceof Error) {
		return value;
	}

	if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
		const newError = new Error(); // eslint-disable-line unicorn/error-message
		destroyCircular({
			from: value,
			seen: [],
			to_: newError,
			maxDepth,
			depth: 0,
		});
		return newError;
	}

	return new NonError(value);
}





const deploy = async (gitUrl, DEPLOYMENT_DIR)  => new Promise( (resolve, reject) => {
	
	const REPO_DIR = path.resolve(
		path.resolve(DEPLOYMENT_DIR),
		path.basename(gitUrl,".git")		
	)
	
	
	if(!fs.existsSync(DEPLOYMENT_DIR)){
		mkdirs(DEPLOYMENT_DIR)
	}
	
	if(fs.existsSync(REPO_DIR)){
		fs.rmdirSync(REPO_DIR, {recursive: true})
	}

	const exec = require('child_process').exec
	const p =  exec(`cd ${path.resolve(DEPLOYMENT_DIR)} & git clone ${gitUrl} & cd ${REPO_DIR} & npm i`)
	p.stdout.pipe(process.stdout);
	// p.stderr.on('data', function (data) {
	//   reject(data.toString())
	// })
	p.on("exit", () => {
		const servicePath = path.resolve(REPO_DIR, require(path.resolve(REPO_DIR,"./package.json")).main || "index.js")
		resolve ({
			repo: gitUrl,
			servicePath,
			stdout: p.stdout,
			stderr: p.stderr
		})	
	})
			

})



module.exports = {
	serializeError,
	deserializeError,
	deploy
}