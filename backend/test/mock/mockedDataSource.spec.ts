import { mockedQueryRunner } from 'test/mock/mockedQueryRunner.spec';

export const mockedDataSource = {
	createQueryRunner: jest.fn().mockResolvedValue(mockedQueryRunner),
};
