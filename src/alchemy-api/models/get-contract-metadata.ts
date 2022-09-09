import { NFTContractMetadata } from './nft';

export interface GetContractMetadata {
  address: string;
  contractMetadata: NFTContractMetadata;
}
