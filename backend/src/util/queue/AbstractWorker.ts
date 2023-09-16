import { EventEmitter } from 'src/util/EventEmitter';
import { v4 as uuid } from 'uuid';

type EventMap = {
	[AbstractWorker.ASSIGN_NEW_TASK]: [];
};

export abstract class AbstractWorker<Task> extends EventEmitter<EventMap> {
	protected id: string;

	public static readonly ASSIGN_NEW_TASK = 'assign-new-task';

	constructor() {
		super();

		this.id = uuid();
	}

	public abstract execute(task: Task): void;

	public getId(): string {
		return this.id;
	}
}
