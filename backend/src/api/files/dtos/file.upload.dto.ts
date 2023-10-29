import { Matches } from 'class-validator';

export class FileUploadDto {
	@Matches(/^(([^<>.|\/\\:"?]|\.(?!\.))+\/)*([^<>|.\/\\:"?]+(\.[^<>|.\/\\:"?]+)+)$/im, {
		message: '$property must be a valid file path',
	})
	readonly path: string;

	constructor(path: string) {
		this.path = path;
	}
}
