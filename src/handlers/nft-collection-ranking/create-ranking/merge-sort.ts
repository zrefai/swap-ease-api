import { NFTRank } from '@server/models/nft-rank';

function merge(left: NFTRank[], right: NFTRank[]): NFTRank[] {
  let arr: NFTRank[] = [];

  while (left.length && right.length) {
    if (left[0].totalScore > right[0].totalScore) {
      const shiftedRank = left.shift();
      if (shiftedRank !== undefined) {
        arr.push(shiftedRank);
      }
    } else {
      const shiftedRank = right.shift();
      if (shiftedRank !== undefined) {
        arr.push(shiftedRank);
      }
    }
  }

  return [...arr, ...left, ...right];
}

export function mergeSort(array: NFTRank[]): NFTRank[] {
  const half = array.length / 2;

  if (array.length < 2) {
    return array;
  }

  const left = array.splice(0, half);

  return merge(mergeSort(left), mergeSort(array));
}
