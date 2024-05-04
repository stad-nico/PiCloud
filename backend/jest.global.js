import 'reflect-metadata';

afterAll(() => {
	global.gc && global.gc();
});
