import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { PathUtils } from 'src/util/PathUtils';

export class DirectoryCreateParams {
	@IsNotEmpty()
	@IsString()
	@Matches(PathUtils.validDirectoryPathRegExp, { message: 'path must be a valid directory path' })
	readonly path: string;

	constructor(path: string) {
		this.path = path;
	}
}
