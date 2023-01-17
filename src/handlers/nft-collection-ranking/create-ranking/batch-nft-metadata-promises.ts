import { NFT } from '@server/alchemy-api/models/nft';
import AlchemyNFTApi from '@server/alchemy-api/nft-api/alchemy-nft-api';
import { TokenType } from '@server/alchemy-api/nft-api/alchemy-nft-api.interfaces';
import chunk from 'lodash.chunk';

const NFT_CHUNK = 5;

/**
 * Uses list of tokenIds to create an array getNFTMedata promises. These promises are then grouped into chunks of NFT_CHUNK.
 * Promises grouped like this will be used for batch requests.
 * @param contractAddress
 * @param tokenType
 * @param tokenIds
 * @param api
 * @returns Grouped getNFTMedata promises
 */
export function batchNFTMetadataPromises(
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
