import 'reflect-metadata';

jest.retryTimes(2);

afterAll(() => {
	global.gc && global.gc();
});
