import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FileRestoreQueryParams {
	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	override: boolean = false;

	constructor(override: boolean) {
		this.override = override;
	}
}
