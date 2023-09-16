import { AbstractTask } from 'src/util/queue/AbstractTask';
import { ParallelWorker } from 'src/util/queue/ParallelWorker';
import { WorkerQueue } from 'src/util/queue/WorkerQueue';

export class ParallelWorkerQueue<Task extends AbstractTask = AbstractTask> extends WorkerQueue<Task, ParallelWorker<Task>> {
	constructor(workerAmt?: number) {
		super(ParallelWorker, workerAmt);
	}
}
