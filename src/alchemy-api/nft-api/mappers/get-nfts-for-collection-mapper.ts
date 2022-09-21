import { GetNFTsForCollection } from '../../models/get-nfts-for-collection';
import { NFT } from '../../models/nft';
import { GetNFTsForCollectionResponse } from '../../models/responses/get-nfts-for-collection-response';
import { getNFTMetadataMapper } from './get-nft-metadata-mapper';

export function getNFTsForCollectionMapper(
  nftCollectionResponse: GetNFTsForCollectionResponse,
  withMetadata: boolean
): GetNFTsForCollection {
  const nfts: NFT[] = nftCollectionResponse.nfts.map((nftResponse) => {
    if (!withMetadata) {
      return {
        id: {
          tokenId: nftResponse.id.tokenId,
        },
      } as unknown as NFT;
    }

    return getNFTMetadataMapper(nftResponse);
  });

  const nftCollection: GetNFTsForCollection = {
    nfts,
    nextToken: nftCollectionResponse?.nextToken,
  };

  return nftCollection;
}
