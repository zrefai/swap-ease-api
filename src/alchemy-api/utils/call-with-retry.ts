import timer from '../../utils/timer';

const MAXIMUM_DEPTH = 7;

export default async function callWithRetry(
  fn: () => Promise<any>,
  depth = 0
): Promise<any> {
  try {
    const result = await fn();

    if (result === undefined) {
      await timer(2 ** depth * 1000 + (Math.floor(Math.random() * 1000) + 1));
      return await callWithRetry(fn, depth + 1);
    }

    return result;
  } catch (error) {
    if (depth > MAXIMUM_DEPTH) {
      throw new Error('Maximum depth exceeded for call with retry');
    }

    // const errorCheck: any = error;
    // if (errorCheck.code === 'ETIMEDOUT' || errorCheck.code === 'ECONNRESET') {
    //   return await callWithRetry(fn, depth + 1);
    // }

    const errorResponse = error as Response;

    if (errorResponse.status === 429 || errorResponse.status === 500) {
      await timer(2 ** depth * 1000 + (Math.floor(Math.random() * 1000) + 1));
      return await callWithRetry(fn, depth + 1);
    }

    // console.log(error);
    // throw new Error(
    //   `Status code ${errorResponse.status} did not match specified policy, callWithRetry exited`
    // );
  }
}
