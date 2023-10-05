import * as fs from 'fs/promises';
import { CreateFileTask } from 'src/tasks/CreateFileTask';
import { FileUtils } from 'src/util/FileUtils';

jest.mock('fs/promises', () => ({
	writeFile: jest.fn(),
	mkdir: jest.fn(),
}));

describe('CreateFileTask', () => {
	it("should throw error 'path is not a valid path' if path leaves base dir", async () => {
		const task = new CreateFileTask(Buffer.from(''), '../test.txt');

		await expect(task.execute()).rejects.toThrow('path ../test.txt is not a valid path');
	});

	it("should throw error 'file already exists'", async () => {
		jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(true);

		const task = new CreateFileTask(Buffer.from(''), '/test/t.txt');

		await expect(task.execute()).rejects.toThrow('file at /test/t.txt already exists');
	});

	it('should create file without error', async () => {
		jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(false);

		const task = new CreateFileTask(Buffer.from(''), '/test/t.txt');

		await expect(task.execute()).resolves.toBeUndefined();
		await expect(fs.writeFile).toBeCalled();
	});

	it("should throw error 'could not create file'", async () => {
		jest.spyOn(FileUtils, 'pathExists').mockResolvedValue(false);
		jest.spyOn(fs, 'writeFile').mockRejectedValue(new Error());

		const task = new CreateFileTask(Buffer.from(''), 'test.txt');

		await expect(task.execute()).rejects.toThrow('could not create file');
	});
});
