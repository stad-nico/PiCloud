import { PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as generateUuid } from 'uuid';

export class BaseEntity {
	@PrimaryKey({ type: 'string', nullable: false, primary: true })
	uuid: string;

	@Property({ type: 'string', nullable: false })
	name: string;

	@Property({ type: 'boolean', nullable: false })
	isRecycled: boolean = false;

	@Property({ type: 'string', nullable: false })
	created: Date = new Date();

	@Property({ type: 'string', nullable: false, onUpdate: () => new Date() })
	updated: Date = new Date();

	public constructor(name: string, isRecycled: boolean = false, uuid: string = generateUuid()) {
		this.uuid = uuid;
		this.name = name;
		this.isRecycled = isRecycled;
	}
}
