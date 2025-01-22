import { DirectoryDeleteParams } from 'src/modules/directories/mapping/delete';

describe('DirectoryDeleteParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryDeleteParams as any)('path')).toBeInstanceOf(DirectoryDeleteParams);
	});
});
