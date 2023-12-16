import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from 'src/db/entities/BaseEntity';
import { v4 as generateUuid } from 'uuid';

@Entity({ tableName: 'files' })
export class File extends BaseEntity {
	@Property({ type: 'int', nullable: false })
	size: number;

	@Property({ type: 'string', nullable: false })
	mimeType: string;

	public constructor(
		name: string,
		parent: string,
		size: number,
		mimeType: string,
		isRecycled: boolean = false,
		uuid: string = generateUuid()
	) {
		super(name, parent, isRecycled, uuid);

		this.size = size;
		this.mimeType = mimeType;
	}

	public getUuidAsDirPath() {
		return '';
	}
}
