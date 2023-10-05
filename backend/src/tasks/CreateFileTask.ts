import { HttpStatus } from '@nestjs/common';
import { AbstractTask } from 'src/tasks/AbstractTask';
import { FileUtils } from 'src/util/FileUtils';
import { ServerError } from 'src/util/ServerError';

import * as fs from 'fs/promises';
import * as path from 'path';

export class CreateFileTask extends AbstractTask<void | ServerError<HttpStatus.BAD_REQUEST | HttpStatus.CONFLICT>> {
	private buffer: Buffer;

	private fullPath: string;

	constructor(buffer: Buffer, fullPath: string) {
		super();

		this.buffer = buffer;
		this.fullPath = fullPath;
	}

	public async execute(): Promise<void> {
		if (!FileUtils.isPathRelative(this.fullPath)) {
			throw new ServerError(`path ${this.fullPath} is not a valid path`, HttpStatus.BAD_REQUEST);
		}

		let resolvedPath = await FileUtils.join(this.fullPath);

		if (await FileUtils.pathExists(resolvedPath)) {
			throw new ServerError(`file at ${this.fullPath} already exists`, HttpStatus.CONFLICT);
		}

		try {
			if (!(await FileUtils.pathExists(path.dirname(resolvedPath)))) {
				await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
			}

			await fs.writeFile(resolvedPath, this.buffer);
		} catch (e) {
			throw new Error('could not create file');
		}
	}
}
