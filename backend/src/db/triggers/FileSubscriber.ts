import { EventArgs, EventSubscriber } from '@mikro-orm/core';
import { File } from 'src/db/entities/File';

export class FileSubscriber implements EventSubscriber<File> {
	async afterCreate(args: EventArgs<File>): Promise<void> {}
}
