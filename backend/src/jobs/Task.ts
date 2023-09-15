import { AbstractTask } from 'src/util/queue/AbstractTask';

export class TestTask extends AbstractTask {
	constructor() {
		super();
	}

	public execute() {
		console.log(`task ${this.id} starting`);
		let f = 0;
		for (let i = 0; i < 2_000_000_000; i++) {
			f = i;
		}

		console.log(`task ${this.id} finished`);
		return f;
	}

	public getId(): string {
		return this.id;
	}
}
