import { NFTRank } from './nft-rank';

export interface NFTSortedRanking {
  _id: string;
  contractAddress: string;
  sortedRanking: NFTRank[];
}
