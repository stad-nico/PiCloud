import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'tree' })
export class Tree {
	@PrimaryKey({ type: 'string', nullable: false, primary: true })
	parent!: string;

	@Property({ type: 'string', nullable: false, primary: true })
	child!: string;

	@Property({ type: 'string', nullable: false, primary: true })
	depth!: number;
}
