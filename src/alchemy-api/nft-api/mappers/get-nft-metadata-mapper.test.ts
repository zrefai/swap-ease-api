import { NFT, NFTMetadata } from '../../models/nft';
import { NFTResponse } from '../../models/responses/nft-response';
import { TokenType } from '../alchemy-nft-api.interfaces';
import { getNFTMetadataMapper } from './get-nft-metadata-mapper';

const nftResponse: NFTResponse = {
  contract: {
    address: 'address',
  },
  id: {
    tokenId: 'id',
    tokenMetadata: {
      tokenType: 'ERC21',
    },
  },
  title: 'title',
  description: 'description',
  tokenUri: {
    raw: 'raw',
    gateway: 'gateway',
  },
  metadata: {
    image: 'image',
    external_url: 'url',
    background_color: 'background_color',
    name: 'name',
    description: 'description',
    attributes: [
      {
        trait_type: 'type',
        value: 'value',
      },
    ],
    traits: undefined,
  },
  error: undefined,
  timeLastUpdated: 'time',
  contractMetadata: {
    name: 'name',
    symbol: 'symbol',
    totalSupply: 'supply',
    tokenType: 'ERC21',
  },
};

describe('getNFTMetadataMapper', () => {
  it('maps object to expected return', () => {
    const result = getNFTMetadataMapper(nftResponse);

    const expectedResult: NFT = {
      contract: {
        address: 'address',
      },
      id: {
        tokenId: 'id',
        tokenMetadata: {
          tokenType: 'ERC21' as TokenType,
        },
      },
      title: 'title',
      description: 'description',
      tokenUri: {
        raw: 'raw',
        gateway: 'gateway',
      },
      metadata: {
        image: 'image',
        external_url: 'url',
        background_color: 'background_color',
        name: 'name',
        description: 'description',
        attributes: [
          {
            trait_type: 'type',
            value: 'value',
          },
        ],
      },
      error: undefined,
      timeLastUpdated: 'time',
      contractMetadata: {
        name: 'name',
        symbol: 'symbol',
        totalSupply: 'supply',
        tokenType: 'ERC21' as TokenType,
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('maps metadata to expected return', () => {
    const result = getNFTMetadataMapper(nftResponse);

    const expectedResult: NFTMetadata = {
      image: 'image',
      external_url: 'url',
      background_color: 'background_color',
      name: 'name',
      description: 'description',
      attributes: [
        {
          trait_type: 'type',
          value: 'value',
        },
      ],
    };

    expect(result.metadata).toEqual(expectedResult);
  });

  it('maps metadata to expected return when response metadata is a string', () => {
    const result = getNFTMetadataMapper({ ...nftResponse, metadata: 'string' });

    const expectedResult: NFTMetadata = {
      image: undefined,
      external_url: undefined,
      background_color: undefined,
      name: undefined,
      description: undefined,
      attributes: [],
    };

    expect(result.metadata).toEqual(expectedResult);
  });

  it('maps attributes from traits when traits property is valid in response', () => {
    const result = getNFTMetadataMapper({
      ...nftResponse,
      metadata: {
        image: 'image',
        external_url: 'url',
        background_color: 'background_color',
        name: 'name',
        description: 'description',
        attributes: undefined,
        traits: [
          {
            trait_type: 'type',
            value: 'value',
          },
        ],
      },
    });

    const expectedResult: NFTMetadata = {
      image: 'image',
      external_url: 'url',
      background_color: 'background_color',
      name: 'name',
      description: 'description',
      attributes: [
        {
          trait_type: 'type',
          value: 'value',
        },
      ],
    };

    expect(result.metadata).toEqual(expectedResult);
  });

  it('maps attributes as empty when all attribute properties are undefined', () => {
    const result = getNFTMetadataMapper({
      ...nftResponse,
      metadata: {
        image: 'image',
        external_url: 'url',
        background_color: 'background_color',
        name: 'name',
        description: 'description',
        attributes: undefined,
        traits: undefined,
      },
    });

    const expectedResult: NFTMetadata = {
      image: 'image',
      external_url: 'url',
      background_color: 'background_color',
      name: 'name',
      description: 'description',
      attributes: [],
    };

    expect(result.metadata).toEqual(expectedResult);
  });

  it('maps object when values are undefined', () => {
    const nftResponse: NFTResponse = {
      contract: {
        address: 'address',
      },
      id: {
        tokenId: 'id',
        tokenMetadata: {
          tokenType: undefined,
        },
      },
      title: undefined,
      description: undefined,
      tokenUri: {
        raw: undefined,
        gateway: undefined,
      },
      metadata: {
        image: undefined,
        external_url: undefined,
        background_color: undefined,
        name: undefined,
        description: undefined,
        attributes: undefined,
        traits: undefined,
      },
      error: undefined,
      timeLastUpdated: undefined,
      contractMetadata: {
        name: undefined,
        symbol: undefined,
        totalSupply: undefined,
        tokenType: undefined,
      },
    };

    const result = getNFTMetadataMapper(nftResponse);

    const expectedResult: NFT = {
      contract: {
        address: 'address',
      },
      id: {
        tokenId: 'id',
        tokenMetadata: {
          tokenType: undefined,
        },
      },
      title: undefined,
      description: undefined,
      tokenUri: {
        raw: '',
        gateway: '',
      },
      metadata: {
        image: undefined,
        external_url: undefined,
        background_color: undefined,
        name: undefined,
        description: undefined,
        attributes: [],
      },
      error: undefined,
      timeLastUpdated: undefined,
      contractMetadata: {
        name: undefined,
        symbol: undefined,
        totalSupply: undefined,
        tokenType: undefined,
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
