import { TokenType } from '../nft-api/alchemy-nft-api.interfaces';

export interface NFTContract {
  address: string;
}

export interface NFTId {
  tokenId: string;
  tokenMetadata: {
    tokenType: TokenType | undefined;
  };
}

export interface NFTTokenUri {
  raw: string;
  gateway: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  image: string | undefined;
  external_url: string | undefined;
  background_color: string | undefined;
  name: string | undefined;
  description: string | undefined;
  attributes: NFTAttribute[];
}

export interface NFTContractMetadata {
  name: string | undefined;
  symbol: string | undefined;
  totalSupply: string | undefined;
  tokenType: string | undefined;
}

export interface NFT {
  contract: NFTContract;
  id: NFTId;
  title: string | undefined;
  description: string | undefined;
  tokenUri: NFTTokenUri;
  metadata: NFTMetadata;
  error: string | undefined;
  timeLastUpdated: string | undefined;
  contractMetadata: NFTContractMetadata | undefined;
}
