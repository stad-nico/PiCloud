import * as path_ from 'path';
import { DirectoryCreateParams } from 'src/api/directory/mapping/create/directory.create.params';
import { Directory } from 'src/db/entities/Directory';
import { PathUtils } from 'src/util/PathUtils';
import { ValidationError } from 'src/util/ValidationError';

export class DirectoryCreateDto {
	readonly path: string;

	private constructor(path: string) {
		this.path = path;
	}

	public static from(directoryCreateParams: DirectoryCreateParams) {
		const normalizedPath = PathUtils.normalize(directoryCreateParams.path);

		if (!PathUtils.isValidDirectoryPath(normalizedPath)) {
			throw new ValidationError(`path ${directoryCreateParams.path} is not a valid directory path`);
		}

		return new DirectoryCreateDto(normalizedPath);
	}

	public toDirectory(parentUuid: string): Pick<Directory, 'name' | 'parent'> {
		return {
			name: path_.basename(this.path),
			parent: parentUuid,
		};
	}
}
