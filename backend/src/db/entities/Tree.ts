import { Column, Entity, Generated, Index, PrimaryColumn } from 'typeorm';

@Entity('tree')
@Index(['child', 'parent'], { unique: true })
export class Tree {
	@PrimaryColumn({ type: 'int', nullable: false })
	@Generated('increment')
	readonly id!: number;

	@Column({ type: 'varchar', nullable: true, default: null })
	readonly parent!: string | null;

	@Column({ type: 'varchar', nullable: false })
	readonly child!: string;

	@Column({ type: 'int', nullable: false, default: 0 })
	readonly depth!: number;
}
