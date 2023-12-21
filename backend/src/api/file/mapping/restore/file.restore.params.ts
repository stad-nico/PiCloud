import { IsUUID } from 'class-validator';

export class FileRestoreParams {
	@IsUUID()
	readonly id: string;

	constructor(id: string) {
		this.id = id;
	}
}
