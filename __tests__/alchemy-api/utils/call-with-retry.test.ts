import callWithRetry from '@server/alchemy-api/utils/call-with-retry';
import timer from '@server/utils/timer';

jest.mock('@server/utils/timer');
const timerMock = timer as jest.Mock;

describe('callWithRetry', () => {
  it('returns success', async () => {
    const mockFunc = jest.fn().mockResolvedValue(true);

    const response = await callWithRetry(mockFunc);

    expect(response).toEqual(true);
  });

  it('succeeds after second pass resolves, first depth fails from 429 status', async () => {
    const mockFunc = jest.fn();

    mockFunc.mockRejectedValueOnce({ status: 429 });
    mockFunc.mockResolvedValueOnce(true);

    timerMock.mockResolvedValue(true);

    const response = await callWithRetry(mockFunc);

    expect(response).toEqual(true);
  });

  it('succeeds after second pass resolves, first depth fails from 500 status', async () => {
    const mockFunc = jest.fn();

    mockFunc.mockRejectedValueOnce({ status: 500 });
    mockFunc.mockResolvedValueOnce(true);

    timerMock.mockResolvedValue(true);

    const response = await callWithRetry(mockFunc);

    expect(response).toEqual(true);
  });

  it('throws an error when maximum depth is exceeded', async () => {
    const mockFunc = jest.fn().mockRejectedValue(false);

    try {
      await callWithRetry(mockFunc, 8);
    } catch (error) {
      expect(error).toEqual(
        new Error('Maximum depth exceeded for call with retry')
      );
    }
  });

  it('throws an error, mock function does not ever resolve', async () => {
    const mockFunc = jest.fn();

    mockFunc.mockRejectedValue({ status: 500 });

    timerMock.mockResolvedValue(true);

    try {
      await callWithRetry(mockFunc);
    } catch (error) {
      expect(error).toEqual(
        new Error('Maximum depth exceeded for call with retry')
      );
    }
  });

  it('throws an error when status code does not match retry policy', async () => {
    const mockFunc = jest.fn();

    mockFunc.mockRejectedValue({ status: 401 });

    timerMock.mockResolvedValue(true);

    try {
      await callWithRetry(mockFunc);
    } catch (error) {
      expect(error).toEqual(
        new Error(
          'Status code did not match specified policy, callWithRetry exited'
        )
      );
    }
  });
});
