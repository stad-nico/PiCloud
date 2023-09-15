import { TestTask } from 'src/jobs/Task';
import { ParallelWorkerQueue } from 'src/util/queue/ParallelWorkerQueue';

let queue = new ParallelWorkerQueue(2);

for (let i = 0; i < 10; i++) {
	queue.addTask(new TestTask());
}
