import { IsNotEmpty, IsString } from 'class-validator';

export class DirectoryCreateParams {
	@IsNotEmpty()
	@IsString()
	// @Matches(PathUtils.validDirectoryPathRegExp, { message: 'path must be a valid directory path' })
	readonly path: string;

	constructor(path: string) {
		this.path = path;
	}
}
