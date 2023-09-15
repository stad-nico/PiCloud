import { AbstractQueue } from 'src/util/queue/AbstractQueue';
import { AbstractWorker } from 'src/util/queue/AbstractWorker';

export abstract class WorkerQueue<Task, Worker extends AbstractWorker<Task>> extends AbstractQueue<Task> {
	public static readonly INITIAL_WORKERS_AMT = 5;

	private workers: Map<string, Worker>;

	private idleWorkers: string[];

	constructor(workerClass: new () => Worker, workerAmt: number = WorkerQueue.INITIAL_WORKERS_AMT) {
		super();

		this.workers = new Map();
		this.idleWorkers = [];

		for (let i = 0; i < workerAmt; i++) {
			let worker: Worker = this.createWorker(workerClass);

			worker.on(AbstractWorker.ASSIGN_NEW_TASK, () => this.assignJob(worker));

			this.workers.set(worker.getId(), worker);
			this.idleWorkers.push(worker.getId());
		}
	}

	private assignJob(worker: Worker): void {
		let nextTask: Task | undefined = this.pop();

		if (nextTask) {
			return worker.execute(nextTask);
		}

		this.idleWorkers.push(worker.getId());
	}

	private createWorker(workerClass: new () => Worker): Worker {
		return new workerClass();
	}

	public addTask(task: Task): void {
		if (this.idleWorkers.length === 0) {
			this.push(task);
			return;
		}

		let nextIdleWorkerId: string | undefined = this.idleWorkers.pop();
		let nextIdleWorker: Worker | undefined;

		if (nextIdleWorkerId && this.workers.has(nextIdleWorkerId)) {
			nextIdleWorker = this.workers.get(nextIdleWorkerId);
		}

		if (!nextIdleWorker) {
			return this.addTask(task);
		}

		nextIdleWorker.execute(task);
	}
}
