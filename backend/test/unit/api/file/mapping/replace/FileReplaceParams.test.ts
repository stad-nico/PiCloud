import { FileReplaceParams } from 'src/modules/files/mapping/replace';

describe('FileReplaceParams', () => {
	it('should create instance', () => {
		expect(new (FileReplaceParams as any)('path')).toBeInstanceOf(FileReplaceParams);
	});
});
