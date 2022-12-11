import { NFTContractMetadata } from '@server/alchemy-api/models/nft';
import { rankingInsertOrUpdate } from '@server/data/helpers/ranking-insert-or-update';
import rankings from '@server/data/rankings';
import { NFTCollectionRanking } from '@server/models/nft-collection-ranking';
import { NFTSortedRanking } from '@server/models/nft-sorted-ranking';
import { Alchemy, Network, Nft, NftTokenType } from 'alchemy-sdk';
import chunk from 'lodash.chunk';
import { generateTraitsAndRankedNFTsV2 } from './generate-traits-and-ranked-nfts-v2';
import { mergeSort } from '../merge-sort';
import { NFTCollectionRankingResponse } from '../V1/create-ranking.handler';

const NFT_CHUNK = 5;

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemySdk = new Alchemy(settings);

export async function createRankingV3Handler(
  contractAddress: string
): Promise<NFTCollectionRankingResponse> {
  const currentRanking = await rankings.findOne(contractAddress);

  if (currentRanking?.accuracy === 100) {
    return {
      error:
        'Accuracy is already at 100% for this collection, no need to re-rank this collection',
    } as NFTCollectionRankingResponse;
  }

  const nftContract = await alchemySdk.nft.getContractMetadata(contractAddress);

  const totalSupply =
    nftContract.totalSupply !== undefined && nftContract.totalSupply.length > 0
      ? parseInt(nftContract.totalSupply)
      : undefined;
  const tokenType = nftContract.tokenType;

  if (
    totalSupply !== undefined &&
    totalSupply !== 0 &&
    tokenType !== NftTokenType.UNKNOWN
  ) {
    const nfts = await retrieveCollection(contractAddress);

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
      tokenType,
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

    const { rankedNFTs, traits } = generateTraitsAndRankedNFTsV2(
      totalSupply,
      collection
    );

    const sortedRanking = mergeSort(rankedNFTs);

    const contractMetadata: NFTContractMetadata = {
      name: nftContract?.name,
      symbol: nftContract?.symbol,
      tokenType: nftContract.tokenType,
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
      accuracy: 100,
      error: undefined,
    } as NFTCollectionRankingResponse;
  }

  return {} as NFTCollectionRankingResponse;
}

async function retrieveCollection(contractAddress: string) {
  const collection: Nft[] = [];

  for await (const currentNfts of alchemySdk.nft.getNftsForContractIterator(
    contractAddress
  )) {
    collection.push(currentNfts);
  }

  const reducedNFTs: { [key: string]: Nft } = {};

  collection.forEach((nft) => (reducedNFTs[nft.tokenId] = nft));

  return reducedNFTs;
}

function batchNFTMetadataPromises(
  contractAddress: string,
  tokenType: NftTokenType,
  tokenIds: string[]
) {
  const promises: Promise<Nft>[] = [];

  for (let i = 0; i < tokenIds.length; ++i) {
    async function requestNFTMetadata() {
      return await alchemySdk.nft.getNftMetadata(
        contractAddress,
        tokenIds[i],
        tokenType
      );
    }
    promises.push(requestNFTMetadata());
  }

  return chunk(promises, NFT_CHUNK);
}

async function refetchMissingNFTs(
  contractAddress: string,
  idsToRefetch: string[],
  tokenType: NftTokenType,
  nfts: {
    [key: string]: Nft;
  }
) {
  const collection = { ...nfts };

  let toRefetch = [...idsToRefetch];
  let depth = 0;
  let batchedNFTsToRefetch = batchNFTMetadataPromises(
    contractAddress,
    tokenType,
    toRefetch
  );

  do {
    // Loop through the batched Promises
    for (let i = 0; i < batchedNFTsToRefetch.length; ++i) {
      const resolvedChunk = await Promise.all(batchedNFTsToRefetch[i]);

      // Loop through resolved NFT chunk
      resolvedChunk.forEach((nft: Nft) => {
        if (
          nft.rawMetadata?.attributes &&
          nft.rawMetadata?.attributes.length > 0
        ) {
          // Re-assign valid NFT to collection
          collection[nft.tokenId] = nft;

          // Remove valid tokenId
          const tokenIndex = toRefetch.indexOf(nft.tokenId);
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
      tokenType,
      toRefetch
    );
  } while (depth < 3);

  return {
    collection: Object.values(collection),
    toRefetch,
  };
}

function getNFTsToRefetch(collection: { [key: string]: Nft }): string[] {
  const idsToRefetch: string[] = [];

  // Count traits, accuracy, and nfts to refetch
  Object.keys(collection).forEach((tokenId: string) => {
    const nft = collection[tokenId];
    if (
      nft.metadataError === undefined ||
      (nft.rawMetadata?.attributes && nft.rawMetadata?.attributes.length === 0)
    ) {
      idsToRefetch.push(tokenId);
    }
  });

  return idsToRefetch;
}
