import { parentPort } from 'worker_threads';

parentPort?.on('message', (message) => {
	let result = eval('(function ' + message.func + ')').apply(message.this);
	console.log(result);
	parentPort?.postMessage('finished');
});
