import rankings from '../../../data/rankings';
import { NFTRank } from '../../../models/nft-rank';

export interface NFTSortedRankingResponse {
  nfts: NFTRank[];
  nextIndex: number | undefined;
}

const PAGE_COUNT = 30;

export default async function getSortedRankingHandler(
  contractAddress: string,
  startIndex = '0'
): Promise<NFTSortedRankingResponse> {
  const startIndexNumber = parseInt(startIndex);
  const document = await rankings.getSortedRanking(
    contractAddress,
    startIndexNumber,
    PAGE_COUNT
  );
  const totalSupply = document?.contractMetadata?.totalSupply
    ? parseInt(document.contractMetadata.totalSupply)
    : undefined;

  if (totalSupply !== undefined) {
    const nextIndex = startIndexNumber + PAGE_COUNT;

    return {
      nfts: document?.sortedRanking ?? [],
      nextIndex: nextIndex <= totalSupply ? nextIndex : undefined,
    };
  }

  return {
    nfts: [],
    nextIndex: undefined,
  };
}
