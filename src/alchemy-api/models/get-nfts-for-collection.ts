import { NFT } from './nft';

export interface GetNFTsForCollection {
  nfts: NFT[];
  nextToken: string | undefined;
}
