import { BadRequestException } from '@nestjs/common';
import { PathUtils } from 'src/util/PathUtils';

export class DirectoryNameTooLongException extends BadRequestException {
	public constructor(name: string) {
		super(`directory name ${name} exceeds the limit of ${PathUtils.MaxDirectoryNameLength} chars`);
	}
}
