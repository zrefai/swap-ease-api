import { GetNFTsForCollection } from '@server/alchemy-api/models/get-nfts-for-collection';
import {
  NFTContractMetadata,
  NFT,
  NFTAttribute,
} from '@server/alchemy-api/models/nft';
import AlchemyNFTApi from '@server/alchemy-api/nft-api/alchemy-nft-api';
import { TokenType } from '@server/alchemy-api/nft-api/alchemy-nft-api.interfaces';
import { rankingInsertOrUpdate } from '@server/data/helpers/ranking-insert-or-update';
import rankings from '@server/data/rankings';
import { NFTCollectionRanking } from '@server/models/nft-collection-ranking';
import { NFTRank } from '@server/models/nft-rank';
import { NFTSortedRanking } from '@server/models/nft-sorted-ranking';
import timer from '@server/utils/timer';
import chunk from 'lodash.chunk';
import { NFTCollectionRankingResponse } from '../V1/create-ranking.handler';

const COLLECTION_CHUNK = 5;
const NFT_CHUNK = 25;

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

  // TODO: can get total supply from etherscan API

  if (totalSupply !== undefined && totalSupply !== 0 && tokenType) {
    const chunkedPromises = batchCollectionPromises(
      contractAddress,
      totalSupply,
      alchemyNFTApi
    );

    const nfts = await resolveCollectionPromises(chunkedPromises);

    const generatedData = generateDataAndNFTsToRefetch(totalSupply, nfts);

    console.log('Valid Collection NFTs:', generatedData.validNFTs);

    const validCollectionNFTs = (generatedData.validNFTs / totalSupply) * 100;
    if (validCollectionNFTs < 70) {
      return {
        error: `Accuracy for fetched collection NFTs was ${validCollectionNFTs}, should be over 70%. Please try to create a ranking at a later time.`,
      } as NFTCollectionRankingResponse;
    }

    const { collection, traits, validNFTs } = await refetchMissingNFTs(
      contractAddress,
      generatedData,
      tokenType as TokenType,
      alchemyNFTApi,
      nfts
    );

    console.log('Valid Collection NFTs after refetch:', validNFTs);

    const accuracy = parseFloat(((validNFTs / totalSupply) * 100).toFixed(3));
    if (accuracy < 95) {
      return {
        error: `Ranking accuracy was ${accuracy}. Should be at least 95. Please try to create a ranking at a later time`,
      } as NFTCollectionRankingResponse;
    }

    const traitScores = generateTraitScores(totalSupply, traits);

    const sortedRanking = assignAndSort(traitScores, Object.values(collection));

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
      traitScores,
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
      error: undefined,
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
  generatedData: GenerateDataAndNFTsToRefetchResponse,
  tokenType: TokenType,
  alchemyNFTApi: AlchemyNFTApi,
  nfts: {
    [key: string]: NFT;
  }
) {
  const collection = { ...nfts };

  const traits = { ...generatedData.traits };
  let toRefetch = [...generatedData.idsToRefetch];
  let validNFTs = generatedData.validNFTs;
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
          // When attributes are valid, count data
          nft.metadata.attributes.forEach((attribute: NFTAttribute) => {
            if (attribute.trait_type in traits) {
              if (attribute.value in traits[attribute.trait_type]) {
                traits[attribute.trait_type][attribute.value] += 1;
              } else {
                traits[attribute.trait_type][attribute.value] = 1;
              }
            } else {
              traits[attribute.trait_type] = {};
              traits[attribute.trait_type][attribute.value] = 1;
            }
          });

          // Re-apply to valid count
          validNFTs += 1;
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
    collection,
    traits,
    validNFTs,
  };
}

interface GenerateDataAndNFTsToRefetchResponse {
  traits: { [key: string]: { [key: string]: number } };
  validNFTs: number;
  idsToRefetch: string[];
}

function generateDataAndNFTsToRefetch(
  totalSupply: number,
  collection: { [key: string]: NFT }
): GenerateDataAndNFTsToRefetchResponse {
  const traits: { [key: string]: { [key: string]: number } } = {};
  let validNFTs = totalSupply;
  const idsToRefetch: string[] = [];

  // Count traits, accuracy, and nfts to refetch
  Object.keys(collection).forEach((tokenId: string) => {
    const nft = collection[tokenId];
    if (nft.metadata.attributes.length > 0) {
      nft.metadata.attributes.forEach((attribute: NFTAttribute) => {
        if (attribute.trait_type in traits) {
          if (attribute.value in traits[attribute.trait_type]) {
            traits[attribute.trait_type][attribute.value] += 1;
          } else {
            traits[attribute.trait_type][attribute.value] = 1;
          }
        } else {
          traits[attribute.trait_type] = {};
          traits[attribute.trait_type][attribute.value] = 1;
        }
      });
    } else {
      idsToRefetch.push(tokenId);
      validNFTs -= 1;
    }
  });

  return {
    traits,
    validNFTs,
    idsToRefetch,
  };
}

function generateTraitScores(
  totalSupply: number,
  traits: { [key: string]: { [key: string]: number } }
): {
  [key: string]: {
    [key: string]: number;
  };
} {
  const traitScores: { [key: string]: { [key: string]: number } } = {};

  // Create score for each trait
  Object.keys(traits).forEach((type: string) => {
    traitScores[type] = {};
    Object.keys(traits[type]).forEach((value: string) => {
      traitScores[type][value] = traits[type][value] / totalSupply;
    });
  });

  return traitScores;
}

function assignAndSort(
  traitScores: { [key: string]: { [key: string]: number } } = {},
  fullCollection: NFT[]
): NFTRank[] {
  const assignedNftScores: NFTRank[] = fullCollection.map((nft: NFT) => {
    if (nft.metadata.attributes.length > 0) {
      return {
        tokenId: parseInt(nft.id.tokenId, 16).toString(),
        score: nft.metadata.attributes.reduce(
          (prev: number, curr: Record<string, any>) => {
            return prev + traitScores[curr.trait_type][curr.value];
          },
          0
        ),
        attributes: nft.metadata.attributes,
      };
    }
    return {
      tokenId: parseInt(nft.id.tokenId, 16).toString(),
      score: 0,
      attributes: [],
    };
  });

  return mergeSort(assignedNftScores);
}

function merge(left: NFTRank[], right: NFTRank[]): NFTRank[] {
  let arr: NFTRank[] = [];

  while (left.length && right.length) {
    if (left[0].score < right[0].score) {
      const shiftedRank = left.shift();
      if (shiftedRank !== undefined) {
        arr.push(shiftedRank);
      }
    } else {
      const shiftedRank = right.shift();
      if (shiftedRank !== undefined) {
        arr.push(shiftedRank);
      }
    }
  }

  return [...arr, ...left, ...right];
}

function mergeSort(array: NFTRank[]): NFTRank[] {
  const half = array.length / 2;

  if (array.length < 2) {
    return array;
  }

  const left = array.splice(0, half);

  return merge(mergeSort(left), mergeSort(array));
}
