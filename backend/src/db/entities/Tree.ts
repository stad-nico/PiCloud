import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'tree' })
@Unique({ properties: ['parentId', 'childId'] })
export class Tree {
	@PrimaryKey({ type: 'int', nullable: false, autoincrement: true })
	readonly id!: number;

	@Property({ type: 'varchar', nullable: true, default: null })
	readonly parentId!: string | null;

	@Property({ type: 'varchar', nullable: false })
	readonly childId!: string;

	@Property({ type: 'int', nullable: false, default: 0 })
	readonly depth!: number;
}
