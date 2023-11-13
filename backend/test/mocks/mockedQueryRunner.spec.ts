import { mockedEntityManager } from 'test/mocks/mockedEntityManager.spec';

export const mockedQueryRunner = {
	connect: jest.fn(),
	startTransaction: jest.fn(),
	commitTransaction: jest.fn(),
	release: jest.fn(),
	rollbackTransaction: jest.fn(),
	manager: mockedEntityManager,
};
