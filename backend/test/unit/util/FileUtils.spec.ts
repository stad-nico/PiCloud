import * as fs from 'fs/promises';
import * as path from 'path';
import { FileUtils } from 'src/util/FileUtils';

jest.mock('fs/promises', () => ({
	access: jest.fn(),
}));

jest.mock('src/env/InjectEnv.ts', () => ({
	InjectEnv: jest.fn().mockReturnValue((target: any, key: string) => {
		Object.defineProperty(target, key, {
			get: () => 'test',
		});
	}),
}));

describe('FileUtils', () => {
	describe('isPathRelative', () => {
		it('should return true if path is a relative path that does not leave base dir', () => {
			expect(FileUtils.isPathRelative('t/fff/t.txt')).toBe(true);
			expect(FileUtils.isPathRelative('./t/fff/t.txt')).toBe(true);
			expect(FileUtils.isPathRelative('/t/fff/t.txt')).toBe(true);
		});

		it('should return true if path is a relative path in base dir', () => {
			expect(FileUtils.isPathRelative('/t.txt')).toBe(true);
			expect(FileUtils.isPathRelative('./t.txt')).toBe(true);
			expect(FileUtils.isPathRelative('t.txt')).toBe(true);
		});

		it('should return false if path leaves base dir', () => {
			expect(FileUtils.isPathRelative('../t.txt')).toBe(false);
			expect(FileUtils.isPathRelative('./../t.txt')).toBe(false);
			expect(FileUtils.isPathRelative('./t/f/../../../f.txt')).toBe(false);
		});
	});

	describe('pathExists', () => {
		it('should return false because file does not exist', async () => {
			(fs.access as jest.Mock).mockRejectedValue(new Error());

			await expect(await FileUtils.pathExists('t.txt')).toBe(false);
		});

		it('should return true because file does exists', async () => {
			(fs.access as jest.Mock).mockResolvedValue(undefined);

			await expect(await FileUtils.pathExists('C:')).toBe(true);
		});
	});

	describe('join', () => {
		it("should join the path with 'test' using path.join", () => {
			expect(FileUtils.join('t.txt')).toBe(path.join('test', 't.txt'));
		});
	});

	describe('normalizePathForOS', () => {
		it('should replace forward slashes with backslashes', () => {
			expect(FileUtils['normalizePathForOS']('test/test.txt')).toBe('test\\test.txt');
		});
	});
});
