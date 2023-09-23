import { v4 as uuid } from 'uuid';

export abstract class AbstractTask<T> {
	protected id: string;

	constructor() {
		this.id = uuid();
	}

	public abstract execute(): Promise<T>;

	public getId(): string {
		return this.id;
	}
}
