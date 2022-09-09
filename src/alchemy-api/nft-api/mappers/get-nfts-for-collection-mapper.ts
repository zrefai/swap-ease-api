import { GetNFTsForCollection } from '../../models/get-nfts-for-collection';
import { NFT, NFTMetadata } from '../../models/nft';
import { GetNFTsForCollectionResponse } from '../../models/responses/get-nfts-for-collection-response';
import { NFTMetadataResponse } from '../../models/responses/nft-response';
import { TokenType } from '../alchemy-nft-api';

export function getNFTsForCollectionMapper(
  nftCollectionResponse: GetNFTsForCollectionResponse
): GetNFTsForCollection {
  const nfts: NFT[] = nftCollectionResponse?.nfts?.map((nftResponse) => {
    const metadata = mapMetadata(nftResponse.metadata);

    return {
      contract: {
        address: nftResponse.contract?.address,
      },
      id: {
        tokenId: nftResponse.id.tokenId,
        tokenMetadata: {
          tokenType: nftResponse.id.tokenMetadata.tokenType as TokenType,
        },
      },
      title: nftResponse.title,
      description: nftResponse.description,
      tokenUri: {
        raw: nftResponse.tokenUri.raw ?? '',
        gateway: nftResponse.tokenUri.gateway ?? '',
      },
      metadata,
      error: nftResponse.error,
      timeLastUpdated: nftResponse.timeLastUpdated,
      contractMetadata: {
        name: nftResponse.contractMetadata?.name,
        symbol: nftResponse.contractMetadata?.symbol,
        totalSupply: nftResponse.contractMetadata?.totalSupply ?? '0',
        tokenType: nftResponse.contractMetadata?.tokenType as TokenType,
      },
    };
  });

  const nftCollection: GetNFTsForCollection = {
    nfts,
    nextToken: nftCollectionResponse?.nextToken,
  };

  return nftCollection;
}

function mapMetadata(metaDataResponse: string | NFTMetadataResponse) {
  const metaData = {} as NFTMetadata;

  if (typeof metaDataResponse === 'string') {
    metaData.image = undefined;
    metaData.background_color = undefined;
    metaData.description = undefined;
    metaData.external_url = undefined;
    metaData.name = undefined;
    metaData.attributes = [];
  } else {
    metaData.image = metaDataResponse.image;
    metaData.background_color = metaDataResponse.background_color;
    metaData.description = metaDataResponse.description;
    metaData.external_url = metaDataResponse.external_url;
    metaData.name = metaDataResponse.name;
    metaData.attributes = metaDataResponse.attributes
      ? metaDataResponse.attributes.map((attribute) => {
          return {
            trait_type: attribute.trait_type,
            value: attribute.value,
          };
        })
      : metaDataResponse.traits
      ? metaDataResponse.traits.map((attribute) => {
          return {
            trait_type: attribute.trait_type,
            value: attribute.value,
          };
        })
      : [];
  }
  return metaData;
}
