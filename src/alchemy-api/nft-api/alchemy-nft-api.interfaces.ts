import { GetContractMetadata } from '../models/get-contract-metadata';
import { GetNFTsForCollection } from '../models/get-nfts-for-collection';
import { NFT } from '../models/nft';

export interface IGetNftForCollection {
  contractAddress: string;
  withMetadata?: boolean;
  startToken?: string;
}

export interface IGetNFTMetadata {
  contractAddress: string;
  tokenId: string;
  tokenType: TokenType;
  refreshCache?: boolean;
}

export interface IGetContractMetadata {
  contractAddress: string;
}

export enum TokenType {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

export interface IAlchemyNFTApi {
  getContractMetadata: ({
    contractAddress,
  }: IGetContractMetadata) => Promise<GetContractMetadata>;
  getNFTsForCollection: ({
    contractAddress,
    withMetadata,
    startToken,
  }: IGetNftForCollection) => Promise<GetNFTsForCollection>;
  getNFTMetadata: ({
    contractAddress,
    tokenId,
    tokenType,
    refreshCache,
  }: IGetNFTMetadata) => Promise<NFT>;
}
