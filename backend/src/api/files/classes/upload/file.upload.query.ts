import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FileUploadQueryParams {
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	override: boolean = false;

	constructor(override: boolean = false) {
		this.override = override;
	}
}
