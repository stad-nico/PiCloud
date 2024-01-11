import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class FileUploadParams {
	@IsNotEmpty()
	@IsString()
	@Matches(/^(([^<>.|\/\\:"?]|\.(?!\.))+\/)*([^<>|.\/\\:"?]+(\.[^<>|.\/\\:"?]+)+)$/im, {
		message: '$property must be a valid file path',
	})
	readonly path: string;

	constructor(path: string) {
		this.path = path;
	}
}
