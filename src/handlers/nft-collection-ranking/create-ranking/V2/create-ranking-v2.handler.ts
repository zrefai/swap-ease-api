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

const COLLECTION_CHUNK = 5;
const NFT_CHUNK = 5;

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

  // TODO: Switch to v1 if total supply is not available
  return {} as NFTCollectionRankingResponse;
}

function batchCollectionPromises(
  contractAddress: string,
  totalSupply: number,
  api: AlchemyNFTApi
) {
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

function batchNFTMetadataPromises(
  contractAddress: string,
  tokenType: TokenType,
  tokenIds: string[],
  api: AlchemyNFTApi
) {
  const promises: Promise<NFT>[] = [];

  for (let i = 0; i < tokenIds.length; ++i) {
    async function requestNFTMetadata() {
      return await api.getNFTMetadata({
        contractAddress,
        tokenId: tokenIds[i],
        tokenType,
      });
    }
    promises.push(requestNFTMetadata());
  }

  return chunk(promises, NFT_CHUNK);
}

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

async function refetchMissingNFTs(
  contractAddress: string,
  idsToRefetch: string[],
  tokenType: TokenType,
  alchemyNFTApi: AlchemyNFTApi,
  nfts: {
    [key: string]: NFT;
  }
) {
  const collection = { ...nfts };

  let toRefetch = [...idsToRefetch];
  let depth = 0;
  let batchedNFTsToRefetch = batchNFTMetadataPromises(
    contractAddress,
    tokenType as TokenType,
    toRefetch,
    alchemyNFTApi
  );

  do {
    // Loop through the batched Promises
    for (let i = 0; i < batchedNFTsToRefetch.length; ++i) {
      const resolvedChunk = await Promise.all(batchedNFTsToRefetch[i]);

      // Loop through resolved NFT chunk
      resolvedChunk.forEach((nft: NFT) => {
        if (nft.metadata.attributes.length > 0) {
          // Re-assign valid NFT to collection
          collection[nft.id.tokenId] = nft;

          // Remove valid tokenId
          const tokenIndex = toRefetch.indexOf(nft.id.tokenId);
          if (tokenIndex > -1) {
            toRefetch.splice(tokenIndex, 1);
          }
        }
      });
    }

    if (toRefetch.length === 0) {
      break;
    }

    depth += 1;
    batchedNFTsToRefetch = batchNFTMetadataPromises(
      contractAddress,
      tokenType as TokenType,
      toRefetch,
      alchemyNFTApi
    );
  } while (depth < 3);

  return {
    collection: Object.values(collection),
    toRefetch,
  };
}

function getNFTsToRefetch(
  // totalSupply: number,
  collection: { [key: string]: NFT }
): string[] {
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
