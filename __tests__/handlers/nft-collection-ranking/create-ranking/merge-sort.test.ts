import { mergeSort } from '@server/handlers/nft-collection-ranking/create-ranking/merge-sort';
import {
  NFTRank,
  NFTRankMetadata,
  NFTRankTokenUri,
} from '@server/models/nft-rank';

describe('mergeSort', () => {
  it.each([
    [
      3,
      [
        generateNFTRank(0.1099),
        generateNFTRank(0.0009),
        generateNFTRank(0.20009),
      ],
      [
        generateNFTRank(0.20009),
        generateNFTRank(0.1099),
        generateNFTRank(0.0009),
      ],
    ],
    [
      8,
      [
        generateNFTRank(0.1099),
        generateNFTRank(0.0009),
        generateNFTRank(0.20009),
        generateNFTRank(0.1099),
        generateNFTRank(0.0009),
        generateNFTRank(0.20009),
        generateNFTRank(0.0009),
        generateNFTRank(0.20009),
      ],
      [
        generateNFTRank(0.20009),
        generateNFTRank(0.20009),
        generateNFTRank(0.20009),
        generateNFTRank(0.1099),
        generateNFTRank(0.1099),
        generateNFTRank(0.0009),
        generateNFTRank(0.0009),
        generateNFTRank(0.0009),
      ],
    ],
    [0, [], []],
    [1, [generateNFTRank(0.20009)], [generateNFTRank(0.20009)]],
  ])(
    'sorts from least to greatest (array length: %p)',
    (_length: number, arrayToSort: NFTRank[], expectedSort: NFTRank[]) => {
      const result = mergeSort(arrayToSort);

      expect(result).toEqual(expectedSort);
    }
  );
});

function generateNFTRank(score: number) {
  return {
    tokenId: 'id',
    totalScore: score,
    attributes: [],
    tokenUri: {} as NFTRankTokenUri,
    metadata: {} as NFTRankMetadata,
  } as NFTRank;
}
