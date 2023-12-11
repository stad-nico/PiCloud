import { Matches } from 'class-validator';

export class FileRenameBody {
	@Matches(/^(([^<>.|\/\\:"?]|\.(?!\.))+\/)*([^<>|.\/\\:"?]+(\.[^<>|.\/\\:"?]+)+)$/im, {
		message: '$property must be a valid file path',
	})
	readonly newPath: string;

	constructor(newPath: string) {
		this.newPath = newPath;
	}
}
