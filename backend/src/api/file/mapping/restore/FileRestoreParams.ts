import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FileRestoreParams {
	@IsNotEmpty()
	@IsString()
	@IsUUID()
	readonly uuid: string;

	constructor(uuid: string) {
		this.uuid = uuid;
	}
}
