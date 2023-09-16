import { ILogger } from 'src/logging/ILogger';
import { InjectLogger } from 'src/logging/InjectLogger';
import { AbstractTask } from 'src/util/queue/AbstractTask';
import { AbstractWorker } from 'src/util/queue/AbstractWorker';
import { Worker as WorkerThread } from 'worker_threads';

export class ParallelWorker<Task extends AbstractTask> extends AbstractWorker<Task> {
	private workerThread: WorkerThread;

	@InjectLogger()
	private logger!: ILogger;

	private currentTask!: Task;

	public constructor() {
		super();

		this.workerThread = this.createWorkerThread();
	}

	private createWorkerThread(): WorkerThread {
		let workerThread = new WorkerThread(`${__dirname}/WorkerProcess`);

		workerThread.on('error', this.onError.bind(this));
		workerThread.on('exit', this.onExit.bind(this));
		workerThread.on('online', this.onOnline.bind(this));

		workerThread.on('message', this.onMessage.bind(this));

		return workerThread;
	}

	private onMessage() {
		this.logger.debug(`worker ${this.id} finished task ${this.currentTask.getId()}`);
		this.emit(ParallelWorker.ASSIGN_NEW_TASK);
	}

	private onError(error: unknown) {
		this.logger.error(`task ${this.currentTask.getId()} failed with error ${error}`);
	}

	private onExit() {
		this.logger.debug(`worker process from worker ${this.id} exited`);
		this.workerThread = this.createWorkerThread();
		this.logger.debug(`instantiated new worker process for worker ${this.id}`);
	}

	private onOnline() {
		this.logger.debug(`worker process from worker ${this.id} is ready to work`);
	}

	public execute(task: Task): void {
		this.currentTask = task;

		this.logger.debug(`worker ${this.id} starting task ${task.getId()}`);

		this.workerThread.postMessage({
			id: task.getId(),
			func: String(task.execute),
			this: task,
		});
	}
}
