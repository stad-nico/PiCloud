import { v4 as uuid } from 'uuid';

export abstract class AbstractTask {
	protected id: string;

	constructor() {
		this.id = uuid();
	}

	public abstract execute(): void;

	public getId(): string {
		return this.id;
	}
}
