import { GetContractMetadata } from '../models/get-contract-metadata';
import { GetNFTsForCollection } from '../models/get-nfts-for-collection';
import { NFT } from '../models/nft';
import { GetNFTsForCollectionResponse } from '../models/responses/get-nfts-for-collection-response';
import { NFTResponse } from '../models/responses/nft-response';
import callWithRetry from '../utils/call-with-retry';
import { getNFTMetadataMapper } from './mappers/get-nft-metadata-mapper';
import { getNFTsForCollectionMapper } from './mappers/get-nfts-for-collection-mapper';

export enum TokenType {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

interface IGetNftForCollection {
  contractAddress: string;
  withMetadata?: string;
  startToken?: string;
}

interface IGetNFTMetadata {
  contractAddress: string;
  tokenId: string;
  tokenType: TokenType;
  refreshCache?: boolean;
}

interface IGetContractMetadata {
  contractAddress: string;
}

const START_TOKEN =
  '0x0000000000000000000000000000000000000000000000000000000000000001';

export default class AlchemyNFTApi {
  alchemySdk: any;
  apiKey: string | undefined;

  private initialize(): void {
    if (process.env.ALCHEMY_API_KEY === undefined) {
      throw new Error('Api Key is not valid');
    }
    if (process.env.ALCHEMY_API_NFT_URL === undefined) {
      throw new Error('Alchemy NFT url not valid');
    }

    this.apiKey = process.env.ALCHEMY_API_KEY;
    this.alchemySdk = require('api')('@alchemy-docs/v1.0#rjin63ol75h86y9');
    this.alchemySdk.server(process.env.ALCHEMY_API_NFT_URL);
  }

  async getContractMetadata({
    contractAddress,
  }: IGetContractMetadata): Promise<GetContractMetadata> {
    this.initialize();

    try {
      const response: GetContractMetadata =
        await this.alchemySdk.getContractMetadata({ contractAddress });

      return response;
    } catch (error) {
      console.log(error);
      throw new Error('getContractMetadata -- Something went wrong');
    }
  }

  async getNFTsForCollection({
    contractAddress,
    withMetadata = 'true',
    startToken = START_TOKEN,
  }: IGetNftForCollection): Promise<GetNFTsForCollection> {
    this.initialize();

    const callback = async () => {
      return await this.alchemySdk.getNFTsForCollection({
        contractAddress,
        withMetadata,
        startToken,
        apiKey: this.apiKey,
      });
    };

    const response: GetNFTsForCollectionResponse = await callWithRetry(
      callback
    );

    return getNFTsForCollectionMapper(response);
  }

  async getNFTMetadata({
    contractAddress,
    tokenId,
    tokenType,
    refreshCache = false,
  }: IGetNFTMetadata): Promise<NFT> {
    this.initialize();

    if (tokenId === undefined) {
      throw new Error('getNFTMetadata -- TokenId is undefined');
    }
    if (tokenType === undefined) {
      throw new Error('getNFTMetadata -- TokenType is undefined');
    }

    const callback = async () => {
      return await this.alchemySdk.getNFTMetadata({
        contractAddress,
        tokenId,
        tokenType,
        refreshCache,
        apiKey: this.apiKey,
      });
    };

    const response: NFTResponse = await callWithRetry(callback);

    return getNFTMetadataMapper(response);
  }
}
