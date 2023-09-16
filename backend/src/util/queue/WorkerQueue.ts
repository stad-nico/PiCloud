import { ILogger } from 'src/logging/ILogger';
import { InjectLogger } from 'src/logging/InjectLogger';
import { AbstractQueue } from 'src/util/queue/AbstractQueue';
import { AbstractTask } from 'src/util/queue/AbstractTask';
import { AbstractWorker } from 'src/util/queue/AbstractWorker';

export class WorkerQueue<Task extends AbstractTask, Worker extends AbstractWorker<Task>> extends AbstractQueue<Task> {
	public static readonly INITIAL_WORKERS_AMT = 6;

	private workers: Map<string, Worker>;

	private idleWorkers: string[];

	@InjectLogger()
	private logger!: ILogger;

	constructor(workerClass: new () => Worker, workerAmt: number = WorkerQueue.INITIAL_WORKERS_AMT) {
		super();

		this.workers = new Map();
		this.idleWorkers = [];

		for (let i = 0; i < workerAmt; i++) {
			this.createWorker(workerClass);
		}
	}

	private assignTask(worker: Worker): void {
		let nextTask: Task | undefined = this.pop();

		if (nextTask) {
			this.logger.debug(`assigned task ${nextTask.getId()} to worker ${worker.getId()}`);
			this.logger.debug(`idle workers [${this.idleWorkers.length}/${this.workers.size}]`);
			this.logger.debug(`queued tasks [${this.items.length}]`);

			return worker.execute(nextTask);
		}

		this.idleWorkers.push(worker.getId());
	}

	private createWorker(workerClass: new () => Worker): void {
		let worker: Worker = new workerClass();

		worker.on(AbstractWorker.ASSIGN_NEW_TASK, () => this.assignTask(worker));

		this.workers.set(worker.getId(), worker);
		this.idleWorkers.push(worker.getId());

		this.logger.debug(`created worker ${worker.getId()}`);
	}

	public addTask(task: Task): void {
		if (this.idleWorkers.length === 0) {
			this.logger.debug(`no idle worker, added task ${task.getId()} to queue`);
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

		this.logger.debug(`assigned task ${task.getId()} to worker ${nextIdleWorker.getId()}`);
		this.logger.debug(`idle workers [${this.idleWorkers.length}/${this.workers.size}]`);

		nextIdleWorker.execute(task);
	}
}
