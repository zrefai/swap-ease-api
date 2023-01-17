import { NFT, NFTContractMetadata } from '@server/alchemy-api/models/nft';
import rankings from '@server/data/rankings';
import AlchemyNFTApi from '@server/alchemy-api/nft-api/alchemy-nft-api';
import { TokenType } from '@server/alchemy-api/nft-api/alchemy-nft-api.interfaces';
import { rankingInsertOrUpdate } from '@server/data/helpers/ranking-insert-or-update';
import { NFTCollectionRanking } from '@server/models/nft-collection-ranking';
import { NFTRank } from '@server/models/nft-rank';
import { NFTSortedRanking } from '@server/models/nft-sorted-ranking';
import timer from '@server/utils/timer';
import { generateTraitsAndRankedNFTs } from '../generate-traits-and-ranked-nfts';
import { mergeSort } from '../merge-sort';
import { refetchMissingNFTs } from '../refetch-missing-nfts';

export interface NFTCollectionRankingResponse {
  contractAddress: string;
  contractMetadata: NFTContractMetadata;
  accuracy: number;
  error: string | undefined;
  sortedRanking: NFTRank[];
}

export default async function createRankingHandlerV1(
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

  const currentNfts = await alchemyNFTApi.getNFTsForCollection({
    contractAddress,
  });

  const nfts: { [key: string]: NFT } = {};
  const idsToRefetch: string[] = [];

  currentNfts.nfts.forEach((nft) => {
    nfts[nft.id.tokenId] = nft;

    if (nft.metadata.attributes.length === 0) {
      idsToRefetch.push(nft.id.tokenId);
    }
  });

  let nextToken: string | undefined = currentNfts.nextToken;

  // Retrieve all nfts in a collection
  while (nextToken != undefined) {
    const nextNfts = await alchemyNFTApi.getNFTsForCollection({
      contractAddress,
      startToken: nextToken,
    });

    nextNfts.nfts.forEach((nft) => {
      nfts[nft.id.tokenId] = nft;

      if (nft.metadata.attributes.length === 0) {
        idsToRefetch.push(nft.id.tokenId);
      }
    });

    nextToken = nextNfts.nextToken;

    await timer(1000);
  }

  const totalSupply = Object.keys(nfts).length;

  console.log('Valid Collection NFTs:', totalSupply - idsToRefetch.length);

  const validCollectionNFTs =
    ((totalSupply - idsToRefetch.length) / totalSupply) * 100;
  if (validCollectionNFTs < 70) {
    return {
      error: `Accuracy for fetched collection NFTs was ${validCollectionNFTs}\%, should be over 70%. Please try to create a ranking at a later time.`,
    } as NFTCollectionRankingResponse;
  }

  const tokenType = Object.values(nfts)[0].id.tokenMetadata.tokenType;

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

  const contractMetadataResponse = Object.values(nfts)[0].contractMetadata;
  const contractMetadata: NFTContractMetadata = {
    name: contractMetadataResponse?.name,
    symbol: contractMetadataResponse?.symbol,
    tokenType: contractMetadataResponse?.tokenType,
    totalSupply: totalSupply.toString(),
  };

  const newNFTCollectionRanking: Partial<NFTCollectionRanking> = {
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
