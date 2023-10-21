import 'reflect-metadata';
import { EnvVariables, validate } from 'src/env.config';

describe('env.config.ts', () => {
	describe('validate', () => {
		it('should validate config', () => {
			const config: Record<string, unknown> = {
				PORT: 3000,
				DISK_FULL_PATH: 'test',
			};

			expect(() => validate(config)).not.toThrow();
			expect(validate(config)).toBeInstanceOf(EnvVariables);
			expect(validate(config)).toMatchObject({
				PORT: 3000,
				DISK_FULL_PATH: 'test',
			});
		});

		it('should throw error', () => {
			const config: Record<string, unknown> = {};

			expect(() => validate(config)).toThrow();
		});
	});
});
