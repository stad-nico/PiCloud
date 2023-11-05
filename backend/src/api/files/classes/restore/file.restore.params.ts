import { IsUUID } from 'class-validator';

export class FileRestoreParams {
	@IsUUID()
	readonly uuid: string;

	constructor(uuid: string) {
		this.uuid = uuid;
	}
}
