import { NFTResponse } from './nft-response';

export interface GetNFTsForCollectionResponse {
  nfts: NFTResponse[];
  nextToken: string | undefined;
}
