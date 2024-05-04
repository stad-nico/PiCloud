import { DirectoryDeleteParams } from 'src/api/directory/mapping/delete';

describe('DirectoryDeleteParams', () => {
	it('should create instance', () => {
		expect(new (DirectoryDeleteParams as any)('path')).toBeInstanceOf(DirectoryDeleteParams);
	});
});
