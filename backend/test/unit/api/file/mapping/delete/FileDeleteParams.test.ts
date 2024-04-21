import { FileDeleteParams } from 'src/api/file/mapping/delete';

describe('FileDeleteParams', () => {
	it('should create instance', () => {
		expect(new (FileDeleteParams as any)('path')).toBeInstanceOf(FileDeleteParams);
	});
});
