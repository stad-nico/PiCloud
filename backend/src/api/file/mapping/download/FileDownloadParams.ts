import { Matches } from 'class-validator';

export class FileDownloadParams {
	@Matches(/^(([^<>.|\/\\:"?]|\.(?!\.))+\/)*([^<>|.\/\\:"?]+(\.[^<>|.\/\\:"?]+)+)$/im, {
		message: '$property must be a valid file path',
	})
	readonly path: string;

	public constructor(path: string) {
		this.path = path;
	}
}
