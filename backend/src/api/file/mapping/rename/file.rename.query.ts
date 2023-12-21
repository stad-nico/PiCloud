import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FileRenameQueryParams {
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	overwrite: boolean = false;

	constructor(overwrite: boolean = false) {
		this.overwrite = overwrite;
	}
}
