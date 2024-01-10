import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DirectoryRestoreParams {
	@IsNotEmpty()
	@IsString()
	@IsUUID()
	readonly uuid: string;

	constructor(uuid: string) {
		this.uuid = uuid;
	}
}
