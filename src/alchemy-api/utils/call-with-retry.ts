import timer from '../../utils/timer';

export default async function callWithRetry(
  fn: Function,
  depth = 0
): Promise<any> {
  try {
    return await fn();
  } catch (error) {
    if (depth > 7) {
      throw error;
    }

    const errorResponse = error as Response;

    if (errorResponse.status === 429) {
      await timer(2 ** depth * 1000 + (Math.floor(Math.random() * 1000) + 1));
      return callWithRetry(fn, depth + 1);
    }
  }
}
