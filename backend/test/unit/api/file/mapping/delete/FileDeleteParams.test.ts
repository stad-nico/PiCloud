import { FileDeleteParams } from 'src/modules/files/mapping/delete';

describe('FileDeleteParams', () => {
	it('should create instance', () => {
		expect(new (FileDeleteParams as any)('path')).toBeInstanceOf(FileDeleteParams);
	});
});
