import { AbstractTask } from 'src/util/queue/AbstractTask';
import { AbstractWorker } from 'src/util/queue/AbstractWorker';
import { Worker as WorkerThread } from 'worker_threads';

export class ParallelWorker<Task extends AbstractTask> extends AbstractWorker<Task> {
	private workerThread: WorkerThread;

	public constructor() {
		super();

		this.workerThread = importWorker(`${__dirname}\\WorkerProcess`, {});

		function importWorker(path: string, options: WorkerOptions): WorkerThread {
			const resolvedPath = require.resolve(path);
			return new WorkerThread(resolvedPath, {
				...options,
				execArgv: /\.ts$/.test(resolvedPath) ? ['--require', 'ts-node/register'] : undefined,
			});
		}

		this.workerThread.on(
			'message',
			function (this: ParallelWorker<Task>) {
				this.emit(ParallelWorker.ASSIGN_NEW_TASK);
			}.bind(this)
		);
	}

	public execute(task: Task): void {
		console.log(`worker ${this.id} starting task ${task.getId()}`);
		this.workerThread.postMessage({
			id: task.getId(),
			func: String(task.execute),
			this: task,
		});
	}
}
