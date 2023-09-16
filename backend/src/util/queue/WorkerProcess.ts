import { parentPort } from 'worker_threads';

parentPort?.on('message', (message) => {
	let result = eval('(function ' + message.func + ')').apply(message.this);

	if (result instanceof Promise) {
		return result.then((result) => parentPort?.postMessage(result));
	}

	return parentPort?.postMessage(result);
});
