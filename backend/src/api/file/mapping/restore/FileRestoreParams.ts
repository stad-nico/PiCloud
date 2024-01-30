import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FileRestoreParams {
	@IsNotEmpty()
	@IsString()
	@IsUUID()
	readonly id: string;

	constructor(id: string) {
		this.id = id;
	}
}
