import { GetContractMetadata } from '../models/get-contract-metadata';
import { GetNFTsForCollection } from '../models/get-nfts-for-collection';
import { NFT } from '../models/nft';
import { GetNFTsForCollectionResponse } from '../models/responses/get-nfts-for-collection-response';
import { NFTResponse } from '../models/responses/nft-response';
import callWithRetry from '../utils/call-with-retry';
import {
  IAlchemyNFTApi,
  IGetContractMetadata,
  IGetNftForCollection,
  IGetNFTMetadata,
} from './alchemy-nft-api.interfaces';
import { getNFTMetadataMapper } from './mappers/get-nft-metadata-mapper';
import { getNFTsForCollectionMapper } from './mappers/get-nfts-for-collection-mapper';

const START_TOKEN =
  '0x0000000000000000000000000000000000000000000000000000000000000001';

export default class AlchemyNFTApi implements IAlchemyNFTApi {
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
    if (contractAddress === undefined) {
      throw new Error('getContractMetadata -- Contract address cannot be null');
    }

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
    withMetadata = true,
    startToken = START_TOKEN,
  }: IGetNftForCollection): Promise<GetNFTsForCollection> {
    if (contractAddress === undefined) {
      throw new Error('getNFTsForCollection -- ContractAddress is undefined');
    }

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

    return getNFTsForCollectionMapper(response, withMetadata);
  }

  async getNFTMetadata({
    contractAddress,
    tokenId,
    tokenType,
    refreshCache = false,
  }: IGetNFTMetadata): Promise<NFT> {
    if (contractAddress === undefined) {
      throw new Error('getNFTMetadata -- ContractAddress is undefined');
    }
    if (tokenId === undefined) {
      throw new Error('getNFTMetadata -- TokenId is undefined');
    }
    if (tokenType === undefined) {
      throw new Error('getNFTMetadata -- TokenType is undefined');
    }

    this.initialize();

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

    if (response === undefined) {
      throw new Error(
        `NFT metadata came back as undefined -- contractAddress: ${contractAddress}, tokenId: ${tokenId}`
      );
    }

    return getNFTMetadataMapper(response);
  }
}
