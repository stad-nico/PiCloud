import { Matches } from 'class-validator';

export class FileRenameBody {
	@Matches(/^(([^<>.|\/\\:"?]|\.(?!\.))+\/)*([^<>|.\/\\:"?]+(\.[^<>|.\/\\:"?]+)+)$/im, {
		message: '$property must be a valid file path',
	})
	readonly newPath: string;

	public constructor(newPath: string) {
		this.newPath = newPath;
	}
}
