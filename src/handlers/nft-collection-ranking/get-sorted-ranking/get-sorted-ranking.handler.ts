import rankings from '@server/data/rankings';
import sortedRankings from '@server/data/sorted-rankings';
import { NFTRank } from '@server/models/nft-rank';

export interface NFTSortedRankingResponse {
  nfts: NFTRank[];
  nextIndex: number | undefined;
}

const PAGE_COUNT = 30;

export default async function getSortedRankingHandler(
  contractAddress: string,
  startIndex = '0'
): Promise<NFTSortedRankingResponse> {
  const currentRanking = await rankings.findOne(contractAddress);

  if (currentRanking === null) {
    throw new Error(
      "Cannot get ranking for collection that hasn't been processed yet"
    );
  }

  const startIndexNumber = parseInt(startIndex);
  const document = await sortedRankings.getSortedRankings(
    contractAddress,
    startIndexNumber,
    PAGE_COUNT
  );

  if (document === null) {
    throw new Error(
      'Document returned null when trying to get a sorted ranking from the DB'
    );
  }

  const totalSupply = currentRanking.contractMetadata.totalSupply
    ? parseInt(currentRanking.contractMetadata.totalSupply)
    : undefined;

  if (totalSupply !== undefined) {
    const nextIndex = startIndexNumber + PAGE_COUNT;

    return {
      nfts: document?.sortedRanking ?? [],
      nextIndex: nextIndex < totalSupply ? nextIndex : undefined,
    };
  }

  return {
    nfts: [],
    nextIndex: undefined,
  };
}
