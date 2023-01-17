import { NFT } from '@server/alchemy-api/models/nft';
import AlchemyNFTApi from '@server/alchemy-api/nft-api/alchemy-nft-api';
import { TokenType } from '@server/alchemy-api/nft-api/alchemy-nft-api.interfaces';
import { batchNFTMetadataPromises } from './batch-nft-metadata-promises';

/**
 * Uses idsToRefetchList to refetch the attributes of NFTs with missing data.
 * @param contractAddress
 * @param idsToRefetch
 * @param tokenType
 * @param alchemyNFTApi
 * @param nfts
 * @returns an object that contains the properties collection and toRefetch. The collection property is the complete list
 * of NFTs in a collection. At this point, all attributes should have been fetched. The toRefetch property is a list of errant
 * NFTs that the function could not retrieve their attributes for
 */
export async function refetchMissingNFTs(
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
