import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'tree' })
export class Tree {
	@PrimaryKey({ type: 'string', nullable: false, primary: true })
	parent: string;

	@Property({ type: 'string', nullable: false, primary: true })
	child: string;

	@Property({ type: 'string', nullable: false, primary: true })
	depth: number;

	public constructor(parent: string, child: string, depth: number = 0) {
		this.parent = parent;
		this.child = child;
		this.depth = depth;
	}
}
