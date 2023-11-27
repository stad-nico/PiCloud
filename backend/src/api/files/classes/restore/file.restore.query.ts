import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FileRestoreQueryParams {
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	overwrite: boolean = false;

	constructor(overwrite: boolean) {
		this.overwrite = overwrite;
	}
}
