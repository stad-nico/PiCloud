import 'reflect-metadata';
import { EnvVariables, NodeEnv, validate } from 'src/env.config';

describe('env.config.ts', () => {
	describe('validate', () => {
		const config: Record<string, unknown> = {
			PORT: 3000,
			DISK_FULL_PATH: 'test',
		};

		it('should validate config', () => {
			expect(() => validate(config)).not.toThrow();
			expect(validate(config)).toBeInstanceOf(EnvVariables);
			expect(validate(config)).toMatchObject({
				PORT: 3000,
				DISK_FULL_PATH: 'test',
			});
		});

		it('should have default value NodeEnv.Develop as NODE_ENV value in config', () => {
			delete process.env.NODE_ENV;

			expect({ ...validate(config) }).toStrictEqual({
				PORT: 3000,
				DISK_FULL_PATH: 'test',
				NODE_ENV: NodeEnv.Develop,
			});
		});

		it('should have correct NODE_ENV value in config', () => {
			process.env['NODE_ENV'] = 'test';

			expect({ ...validate(config) }).toStrictEqual({
				PORT: 3000,
				DISK_FULL_PATH: 'test',
				NODE_ENV: NodeEnv.Testing,
			});
		});

		it('should throw error', () => {
			const config: Record<string, unknown> = {};

			expect(() => validate(config)).toThrow();
		});
	});
});
