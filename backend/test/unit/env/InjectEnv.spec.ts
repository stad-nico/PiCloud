import { InjectEnv } from 'src/env/InjectEnv';

describe('Inject env variables', () => {
	it('should fail because env variable not found', () => {
		expect(() => InjectEnv('test')({}, 'test')).toThrowError('could not load env[test]');
	});

	it('should work and assign value to property', () => {
		process.env.TEST = 'testvalue';

		let obj = { decorator: undefined };

		expect(() => InjectEnv('TEST')(obj, 'decorator')).not.toThrowError();
		expect(obj['decorator']).toBe('testvalue');
	});
});
