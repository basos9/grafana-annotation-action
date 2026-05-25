import { run } from './index';
import { GrafanaClient } from './grafana';
import * as core from '@actions/core';

jest.mock('./grafana');
const mockedGrafanaClient = GrafanaClient as unknown as jest.Mock<typeof GrafanaClient>;

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
  const setFailedSpy = jest.spyOn(core, 'setFailed').mockImplementation();
  const mockCreateAnnotation = jest.fn().mockRejectedValue(new Error('failed to create annotation'));
  const mockConstructor = jest.fn().mockReturnValue({
    createAnnotation: mockCreateAnnotation,
  });
  mockedGrafanaClient.mockImplementation(mockConstructor);

  await run();

  expect(setFailedSpy).toHaveBeenCalledWith('failed to create annotation');
});


