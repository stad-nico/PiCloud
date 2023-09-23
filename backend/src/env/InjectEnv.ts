import * as path from 'path';

require('dotenv').config({ path: path.resolve(`${__dirname}/../../../.env`) });

export function InjectEnv(name: string) {
	return function (target: any, key: string) {
		let env: string | undefined = process.env[name];

		if (!env) {
			throw new Error(`could not load env[${name}]`);
		}

		Object.defineProperty(target, key, {
			get: () => env,
		});
	};
}
