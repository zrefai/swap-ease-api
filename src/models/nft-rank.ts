import { NFTAttribute } from '../alchemy-api/models/nft';

export interface NFTRank {
  tokenId: string;
  score: number;
  attributes: NFTAttribute[];
}
