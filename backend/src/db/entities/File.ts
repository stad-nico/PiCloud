import { Directory } from 'src/db/entities/Directory';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('files')
export class File {
	@PrimaryColumn({ type: 'varchar', nullable: false, default: () => 'UUID()', unique: true })
	readonly uuid!: string;

	@Column({ type: 'varchar', nullable: false })
	readonly name!: string;

	// @ManyToOne(() => Directory, { onUpdate: 'RESTRICT', onDelete: 'RESTRICT', nullable: true })
	// @JoinColumn({ name: 'parent', referencedColumnName: 'uuid' })
	// readonly parent!: Directory | null;

	@ManyToOne(() => Directory, (directory) => directory.uuid, { onUpdate: 'RESTRICT', onDelete: 'RESTRICT', cascade: true })
	@JoinColumn({ name: 'parentId' })
	readonly parent!: Directory;

	@Column({ type: 'varchar', nullable: true, default: null })
	readonly parentId!: string | null;

	@Column({ type: 'varchar', nullable: false, default: 'application/octet-stream' })
	readonly mimeType!: string;

	@Column({ type: 'bigint', nullable: false, default: 0 })
	readonly size!: number;

	@Column({ type: 'boolean', nullable: false, default: false })
	readonly isRecycled!: boolean;

	@Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP()' })
	readonly created!: Date;

	@Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP()', onUpdate: 'CURRENT_TIMESTAMP()' })
	readonly updated!: Date;
}

// export type File = {
// 	uuid: string;
// 	name: string;
// 	parent: string;
// 	size: number;
// 	mimeType: string;
// 	isRecycled: boolean;
// 	created: Date;
// 	updated: Date;
// 	path: string;
// };

// export type FileNullables = 'parent';
// export const FileNullables = ['parent'];

// export type FileDefaults = 'uuid' | 'mimeType' | 'size' | 'parent' | 'isRecycled' | 'created' | 'updated';
