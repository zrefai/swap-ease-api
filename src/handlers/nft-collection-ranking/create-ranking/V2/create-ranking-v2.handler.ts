import { GetNFTsForCollection } from '@server/alchemy-api/models/get-nfts-for-collection';
import { NFT, NFTContractMetadata } from '@server/alchemy-api/models/nft';
import AlchemyNFTApi from '@server/alchemy-api/nft-api/alchemy-nft-api';
import { TokenType } from '@server/alchemy-api/nft-api/alchemy-nft-api.interfaces';
import { rankingInsertOrUpdate } from '@server/data/helpers/ranking-insert-or-update';
import rankings from '@server/data/rankings';
import { NFTCollectionRanking } from '@server/models/nft-collection-ranking';
import { NFTRank } from '@server/models/nft-rank';
import { NFTSortedRanking } from '@server/models/nft-sorted-ranking';
import timer from '@server/utils/timer';
import chunk from 'lodash.chunk';
import { generateTraitsAndRankedNFTs } from '../generate-traits-and-ranked-nfts';
import { mergeSort } from '../merge-sort';
import { refetchMissingNFTs } from '../refetch-missing-nfts';
import createRankingHandlerV1 from '../V1/create-ranking.handler';

const COLLECTION_CHUNK = 5;

export interface NFTCollectionRankingResponse {
  contractAddress: string;
  contractMetadata: NFTContractMetadata;
  accuracy: number;
  error: string | undefined;
  sortedRanking: NFTRank[];
}

export default async function createRankingV2Handler(
  contractAddress: string
): Promise<NFTCollectionRankingResponse> {
  const currentRanking = await rankings.findOne(contractAddress);

  if (currentRanking?.accuracy === 100) {
    return {
      error:
        'Accuracy is already at 100% for this collection, no need to re-rank this collection',
    } as NFTCollectionRankingResponse;
  }

  const alchemyNFTApi = new AlchemyNFTApi();

  const contractMetadataResponse = await alchemyNFTApi.getContractMetadata({
    contractAddress,
  });

  const totalSupply =
    contractMetadataResponse.contractMetadata.totalSupply !== undefined &&
    contractMetadataResponse.contractMetadata.totalSupply.length > 0
      ? parseInt(contractMetadataResponse.contractMetadata.totalSupply)
      : undefined;
  const tokenType =
    contractMetadataResponse.contractMetadata.tokenType &&
    contractMetadataResponse.contractMetadata.tokenType.length > 0
      ? contractMetadataResponse.contractMetadata.tokenType
      : undefined;

  if (totalSupply !== undefined && totalSupply !== 0 && tokenType) {
    const chunkedPromises = batchCollectionPromises(
      contractAddress,
      totalSupply,
      alchemyNFTApi
    );

    const nfts = await resolveCollectionPromises(chunkedPromises);

    const idsToRefetch = getNFTsToRefetch(nfts);

    console.log('Valid Collection NFTs:', totalSupply - idsToRefetch.length);

    const validCollectionNFTs =
      ((totalSupply - idsToRefetch.length) / totalSupply) * 100;
    if (validCollectionNFTs < 70) {
      return {
        error: `Accuracy for fetched collection NFTs was ${validCollectionNFTs}\%, should be over 70%. Please try to create a ranking at a later time.`,
      } as NFTCollectionRankingResponse;
    }

    const { collection, toRefetch } = await refetchMissingNFTs(
      contractAddress,
      idsToRefetch,
      tokenType as TokenType,
      alchemyNFTApi,
      nfts
    );

    console.log(
      'Valid Collection NFTs after refetch:',
      totalSupply - toRefetch.length
    );

    const accuracy = parseFloat(
      (((totalSupply - toRefetch.length) / totalSupply) * 100).toFixed(3)
    );

    if (accuracy < 95) {
      return {
        error: `Ranking accuracy was ${accuracy}\%. Should be at least 95\%. Please try to create a ranking at a later time`,
      } as NFTCollectionRankingResponse;
    }

    const { rankedNFTs, traits } = generateTraitsAndRankedNFTs(
      totalSupply,
      collection
    );

    const sortedRanking = mergeSort(rankedNFTs);

    const contractMetadata: NFTContractMetadata = {
      name: contractMetadataResponse?.contractMetadata.name,
      symbol: contractMetadataResponse?.contractMetadata.symbol,
      tokenType: contractMetadataResponse?.contractMetadata.tokenType,
      totalSupply: totalSupply.toString(),
    };

    const newNFTCollectionRanking: Partial<NFTCollectionRanking> = {
      _id: contractAddress,
      contractAddress,
      contractMetadata,
      accuracy,
      traits,
    };

    const newSortedRanking: NFTSortedRanking = {
      _id: contractAddress,
      contractAddress,
      sortedRanking,
    };

    await rankingInsertOrUpdate(
      currentRanking,
      newNFTCollectionRanking as NFTCollectionRanking,
      newSortedRanking
    );

    return {
      accuracy,
      error: undefined, // TODO: fill this error spot or remove
    } as NFTCollectionRankingResponse;
  }

  return await createRankingHandlerV1(contractAddress);
}

/**
 * Uses totalSupply to create an array getNFTsForCollection promises (totalSupply / 100 = number of getNFTsForCollection promises).
 * These promises are then grouped into chunks of COLLECTION_CHUNK. Promises grouped like this will be used for batch requests.
 * @param contractAddress
 * @param totalSupply
 * @param api
 * @returns Grouped getNFTsForCollection promises
 */
function batchCollectionPromises(
  contractAddress: string,
  totalSupply: number,
  api: AlchemyNFTApi
): Promise<GetNFTsForCollection>[][] {
  const promises: Promise<GetNFTsForCollection>[] = [];

  for (let i = 1; i < totalSupply; i += 100) {
    async function requestCollection() {
      return await api.getNFTsForCollection({
        contractAddress,
        startToken: i.toString(),
      });
    }
    promises.push(requestCollection());
  }

  return chunk(promises, COLLECTION_CHUNK);
}

/**
 * We resolve all of the chunked promises, format the data using a dictionary. The key-value pair in the dictionary is
 * tokenId-NFT
 * @param chunkedPromises
 * @returns Dictionary of NFT collection data
 */
async function resolveCollectionPromises(
  chunkedPromises: Promise<GetNFTsForCollection>[][]
): Promise<{ [key: string]: NFT }> {
  const nfts: NFT[] = [];

  for (let i = 0; i < chunkedPromises.length; i++) {
    const reducedNFTs = await Promise.all(chunkedPromises[i]).then(
      (data: GetNFTsForCollection[]) => {
        return data.reduce((prev: NFT[], curr: GetNFTsForCollection) => {
          prev.push(...curr.nfts);
          return prev;
        }, [] as NFT[]);
      }
    );

    nfts.push(...reducedNFTs);
    await timer(2000);
  }

  const reducedNFTs: { [key: string]: NFT } = {};

  nfts.forEach((nft) => (reducedNFTs[nft.id.tokenId] = nft));

  return reducedNFTs;
}

/**
 * Goes through the list of NFTs and searches for NFTs that have missing attribute data
 * @param collection
 * @returns A list of token ids that do not have attributes
 */
function getNFTsToRefetch(collection: { [key: string]: NFT }): string[] {
  const idsToRefetch: string[] = [];

  // Count traits, accuracy, and nfts to refetch
  Object.keys(collection).forEach((tokenId: string) => {
    const nft = collection[tokenId];
    if (nft.metadata.attributes.length === 0) {
      idsToRefetch.push(tokenId);
    }
  });

  return idsToRefetch;
}
