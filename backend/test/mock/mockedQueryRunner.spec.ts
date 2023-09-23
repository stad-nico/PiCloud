import { mockedEntityManager } from 'test/mock/mockedEntityManager.spec';

export const mockedQueryRunner = {
	connect: jest.fn(),
	startTransaction: jest.fn(),
	commitTransaction: jest.fn(),
	release: jest.fn(),
	rollbackTransaction: jest.fn(),
	manager: mockedEntityManager,
};
