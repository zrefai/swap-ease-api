import { NFT, NFTMetadata } from '../../models/nft';
import {
  NFTMetadataResponse,
  NFTResponse,
} from '../../models/responses/nft-response';
import { TokenType } from '../alchemy-nft-api.interfaces';

export function getNFTMetadataMapper(nftMetadataResponse: NFTResponse): NFT {
  const metadata = mapMetadata(nftMetadataResponse?.metadata);

  return {
    contract: {
      address: nftMetadataResponse?.contract.address,
    },
    id: {
      tokenId: nftMetadataResponse?.id.tokenId,
      tokenMetadata: {
        tokenType: nftMetadataResponse?.id.tokenMetadata.tokenType as TokenType,
      },
    },
    title: nftMetadataResponse?.title,
    description: nftMetadataResponse?.description,
    tokenUri: {
      raw: nftMetadataResponse?.tokenUri.raw ?? '',
      gateway: nftMetadataResponse?.tokenUri.gateway ?? '',
    },
    metadata,
    error: nftMetadataResponse?.error,
    timeLastUpdated: nftMetadataResponse?.timeLastUpdated,
    contractMetadata: {
      name: nftMetadataResponse?.contractMetadata?.name,
      symbol: nftMetadataResponse?.contractMetadata?.symbol,
      totalSupply: nftMetadataResponse?.contractMetadata?.totalSupply,
      tokenType: nftMetadataResponse?.contractMetadata?.tokenType as TokenType,
    },
  };
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
    metaData.image = metaDataResponse?.image;
    metaData.background_color = metaDataResponse?.background_color;
    metaData.description = metaDataResponse?.description;
    metaData.external_url = metaDataResponse?.external_url;
    metaData.name = metaDataResponse?.name;
    metaData.attributes = metaDataResponse?.attributes
      ? metaDataResponse?.attributes.map((attribute) => {
          return {
            trait_type: attribute.trait_type,
            value: attribute.value,
          };
        })
      : metaDataResponse?.traits
      ? metaDataResponse?.traits.map((attribute) => {
          return {
            trait_type: attribute.trait_type,
            value: attribute.value,
          };
        })
      : [];
  }
  return metaData;
}
