import { FileReplaceParams } from 'src/api/file/mapping/replace';

describe('FileReplaceParams', () => {
	it('should create instance', () => {
		expect(new (FileReplaceParams as any)('path')).toBeInstanceOf(FileReplaceParams);
	});
});
