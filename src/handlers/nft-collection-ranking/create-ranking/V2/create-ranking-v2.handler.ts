import chunk from 'lodash.chunk';
import { GetNFTsForCollection } from '../../../../alchemy-api/models/get-nfts-for-collection';
import {
  NFT,
  NFTAttribute,
  NFTContractMetadata,
} from '../../../../alchemy-api/models/nft';
import AlchemyNFTApi, {
  TokenType,
} from '../../../../alchemy-api/nft-api/alchemy-nft-api';
import rankings from '../../../../data/rankings';
import { NFTCollectionRanking } from '../../../../models/nft-collection-ranking';
import { NFTRank } from '../../../../models/nft-rank';
import { NFTCollectionRankingResponse } from '../V1/create-ranking.handler';

export default async function createRankingV2Handler(
  contractAddress: string
): Promise<NFTCollectionRankingResponse> {
  // TODO: remodel after alchemy summary and prevelance scores
  // TODO: check current accuracy before running?
  // TODO: find out why accuracy goes above 100%
  const alchemyNftApi = new AlchemyNFTApi();

  const contractMetadataResponse = await alchemyNftApi.getContractMetadata({
    contractAddress,
  });

  const totalSupply =
    contractMetadataResponse.contractMetadata.totalSupply !== undefined
      ? parseInt(contractMetadataResponse.contractMetadata.totalSupply)
      : undefined;
  const tokenType = contractMetadataResponse.contractMetadata.tokenType;

  if (totalSupply !== undefined && totalSupply !== 0 && tokenType) {
    const chunkedPromises = batchCollectionPromises(
      contractAddress,
      totalSupply,
      alchemyNftApi
    );

    const nfts = await resolveCollectionPromises(chunkedPromises);

    async function refetchMissingNFTs(
      batchedNFTPromises: Promise<NFT>[][],
      depth = 0
    ): Promise<void> {
      console.log('Refetch per depth:', toRefetch.length);
      if (batchedNFTPromises.length === 0 || depth > 2) {
        return;
      }

      for (let i = 0; i < batchedNFTPromises.length; ++i) {
        await Promise.all(batchedNFTPromises[i]).then((data: NFT[]) => {
          for (let i = 0; i < data.length; ++i) {
            const value = data[i];

            if (value.id.tokenId && value.metadata.attributes.length > 0) {
              value.metadata.attributes.forEach((attribute: NFTAttribute) => {
                if (attribute.value in traits) {
                  traits[attribute.value] += 1;
                } else {
                  traits[attribute.value] = 1;
                }
              });

              validNFTs += 1;
              nfts[value.id.tokenId] = value;

              // Remove id since it retrieved properly
              const tokenIndex = toRefetch.indexOf(value.id.tokenId);

              if (tokenIndex > -1) {
                toRefetch = toRefetch.splice(tokenIndex, 1);
              }
            }
          }
        });
      }

      const newBatchedNFTsToRefetch = batchNFTMetadataPromises(
        contractAddress,
        tokenType as TokenType,
        toRefetch,
        alchemyNftApi
      );
      await refetchMissingNFTs(newBatchedNFTsToRefetch, depth + 1);
    }

    const generatedData = generateDataAndNFTsToRefetch(totalSupply, nfts);

    const traits = { ...generatedData.traits };
    let toRefetch = [...generatedData.idsToRefetch];
    let validNFTs = generatedData.validNFTs;

    console.log(validNFTs);

    const batchedNFTsToRefetch = batchNFTMetadataPromises(
      contractAddress,
      tokenType as TokenType,
      toRefetch,
      alchemyNftApi
    );

    await refetchMissingNFTs(batchedNFTsToRefetch);

    console.log(validNFTs);

    const accuracy = parseFloat(((validNFTs / totalSupply) * 100).toFixed(3));
    if (accuracy < 95) {
      return {
        error: `Ranking accuracy was ${accuracy}. Should be at least 95. Please try to create a ranking at a later time`,
      } as NFTCollectionRankingResponse;
    }

    const traitScores: { [key: string]: number } = {};

    // Create score for each trait
    Object.keys(traits).forEach((key: string) => {
      traitScores[key] = parseFloat(
        (1 / (traits[key] / totalSupply)).toFixed(3)
      );
    });

    const sortedRanking = assignAndSort(traitScores, Object.values(nfts));

    const contractMetadata: NFTContractMetadata = {
      name: contractMetadataResponse?.contractMetadata.name,
      symbol: contractMetadataResponse?.contractMetadata.symbol,
      tokenType: contractMetadataResponse?.contractMetadata.tokenType,
      totalSupply: totalSupply.toString(),
    };

    const newNFTCollectionRanking: Partial<NFTCollectionRanking> = {
      contractAddress,
      contractMetadata,
      accuracy,
      traits,
      traitScores,
      sortedRanking,
    };

    const isInserted = await rankings.insertOne(
      newNFTCollectionRanking as NFTCollectionRanking
    );

    if (!isInserted) {
      return {
        error: `Could not add new collection ranking for ${contractMetadata?.name}: ${accuracy}% accuracy`,
      } as NFTCollectionRankingResponse;
    }

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

  return chunk(promises, 10);
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

  return chunk(promises, 10);
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
  }

  const reducedNFTs: { [key: string]: NFT } = {};

  nfts.forEach((nft) => (reducedNFTs[nft.id.tokenId] = nft));

  return reducedNFTs;
}

function generateDataAndNFTsToRefetch(
  totalSupply: number,
  collection: { [key: string]: NFT }
) {
  const traits: { [key: string]: number } = {};
  let validNFTs = totalSupply;
  const idsToRefetch: string[] = [];

  // Count traits, accuracy, and nfts to refetch
  Object.keys(collection).forEach((tokenId: string) => {
    const nft = collection[tokenId];
    if (nft.metadata.attributes.length > 0) {
      nft.metadata.attributes.forEach((attribute: NFTAttribute) => {
        if (attribute.value in traits) {
          traits[attribute.value] += 1;
        } else {
          traits[attribute.value] = 1;
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

function assignAndSort(
  traitScores: { [key: string]: number },
  fullCollection: NFT[]
): NFTRank[] {
  const assignedNftScores: NFTRank[] = fullCollection.map((nft: NFT) => {
    if (nft.metadata.attributes.length > 0) {
      return {
        tokenId: parseInt(nft.id.tokenId, 16).toString(),
        score: nft.metadata.attributes.reduce(
          (prev: number, curr: Record<string, any>) => {
            return prev + traitScores[curr.value];
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
    if (left[0].score > right[0].score) {
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
