import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('files')
export class File {
	@PrimaryColumn({ type: 'varchar', nullable: false })
	fullPath!: string;

	@Column({ type: 'varchar', nullable: false })
	name!: string;

	@Column({ type: 'varchar', nullable: false })
	path!: string;

	@Column({ type: 'varchar', nullable: false })
	mimeType!: string;

	@Column({ type: 'bigint', nullable: false })
	size!: number;

	@CreateDateColumn({ type: 'timestamp', nullable: false })
	created!: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: false })
	updated!: Date;

	constructor(fullPath: string, name: string, path: string, mimeType: string, size: number) {
		this.fullPath = fullPath;
		this.name = name;
		this.path = path;
		this.mimeType = mimeType;
		this.size = size;
	}
}
