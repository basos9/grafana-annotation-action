import { GrafanaClient } from './grafana';

jest.mock('@actions/core', () => ({
  getInput: jest.fn((name: string) => process.env[`INPUT_${name.toUpperCase()}`] || ''),
  info: jest.fn(),
  setFailed: jest.fn(),
}));

import { run } from './index';

jest.mock('./grafana');
const mockedGrafanaClient = GrafanaClient as unknown as jest.Mock<typeof GrafanaClient>;
const mockedCore = jest.requireMock('@actions/core') as {
  setFailed: jest.Mock;
};

process.env.INPUT_APIHOST = 'https://grafana.example.com';
process.env.INPUT_APITOKEN = 'TOKEN';
process.env.INPUT_TEXT = 'TEXT';

it('should create annotation', async () => {
  const mockCreateAnnotation = jest.fn().mockResolvedValue(1);
  const mockConstructor = jest.fn().mockReturnValue({
    createAnnotation: mockCreateAnnotation,
  });
  mockedGrafanaClient.mockImplementation(mockConstructor);

  await run();

  expect(mockConstructor).toHaveBeenCalledWith('https://grafana.example.com', 'TOKEN');
  expect(mockCreateAnnotation).toHaveBeenCalled();
});

it('should fail when annotation creation throws', async () => {
  const mockCreateAnnotation = jest.fn().mockRejectedValue(new Error('failed to create annotation'));
  const mockConstructor = jest.fn().mockReturnValue({
    createAnnotation: mockCreateAnnotation,
  });
  mockedGrafanaClient.mockImplementation(mockConstructor);

  await run();

  expect(mockedCore.setFailed).toHaveBeenCalledWith('failed to create annotation');
});


