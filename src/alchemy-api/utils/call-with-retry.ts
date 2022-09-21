import timer from '../../utils/timer';

const MAXIMUM_DEPTH = 7;

export default async function callWithRetry(
  fn: () => Promise<any>,
  depth = 0
): Promise<any> {
  try {
    return await fn();
  } catch (error) {
    if (depth > MAXIMUM_DEPTH) {
      throw new Error('Maximum depth exceeded for call with retry');
    }

    const errorResponse = error as Response;

    if (errorResponse.status === 429 || errorResponse.status === 500) {
      await timer(2 ** depth * 1000 + (Math.floor(Math.random() * 1000) + 1));
      return await callWithRetry(fn, depth + 1);
    }

    throw new Error(
      'Status code did not match specified policy, callWithRetry exited'
    );
  }
}
