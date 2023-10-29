import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('files')
export class File {
	@PrimaryColumn({ type: 'varchar', nullable: false })
	readonly fullPath: string;

	@Column({ type: 'varchar', nullable: false })
	readonly name: string;

	@Column({ type: 'varchar', nullable: false })
	readonly path: string;

	@Column({ type: 'varchar', nullable: false })
	readonly mimeType: string;

	@Column({ type: 'bigint', nullable: false })
	readonly size: number;

	@CreateDateColumn({ type: 'timestamp', nullable: false })
	readonly created!: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: false })
	readonly updated!: Date;

	constructor(fullPath: string, name: string, path: string, mimeType: string, size: number) {
		this.fullPath = fullPath;
		this.name = name;
		this.path = path;
		this.mimeType = mimeType;
		this.size = size;
	}
}
