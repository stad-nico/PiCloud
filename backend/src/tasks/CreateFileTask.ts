import { HttpStatus } from '@nestjs/common';
import { AbstractTask } from 'src/tasks/AbstractTask';
import { Error as CustomError } from 'src/util/Error';
import { FileUtils } from 'src/util/FileUtils';

import * as fs from 'fs/promises';
import * as path from 'path';

export class CreateFileTask extends AbstractTask<void | CustomError> {
	private buffer: Buffer;

	private fullPath: string;

	constructor(buffer: Buffer, fullPath: string) {
		super();

		this.buffer = buffer;
		this.fullPath = fullPath;
	}

	public async execute(): Promise<void> {
		if (!FileUtils.isPathRelative(this.fullPath)) {
			throw new CustomError(`path ${this.fullPath} is not a valid path`, HttpStatus.BAD_REQUEST);
		}

		let resolvedPath = await FileUtils.resolve(this.fullPath);

		if (await FileUtils.pathExists(resolvedPath)) {
			throw new CustomError(`file at ${this.fullPath} already exists`, HttpStatus.CONFLICT);
		}

		try {
			if (!(await FileUtils.pathExists(path.dirname(resolvedPath)))) {
				fs.mkdir(path.dirname(resolvedPath), { recursive: true });
			}

			await fs.writeFile(resolvedPath, this.buffer);
		} catch (e) {
			if (e instanceof Error) {
				throw new CustomError('could not create file', HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
	}
}
