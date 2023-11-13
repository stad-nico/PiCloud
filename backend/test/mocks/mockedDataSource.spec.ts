import { mockedQueryRunner } from 'test/mocks/mockedQueryRunner.spec';

export const mockedDataSource = {
	createQueryRunner: jest.fn().mockResolvedValue(mockedQueryRunner),
};
