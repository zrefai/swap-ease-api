import { GetContractMetadata } from '@server/alchemy-api/models/get-contract-metadata';
import { GetNFTsForCollection } from '@server/alchemy-api/models/get-nfts-for-collection';
import { NFT } from '@server/alchemy-api/models/nft';
import { rankingInsertOrUpdate } from '@server/data/helpers/ranking-insert-or-update';
import rankings from '@server/data/rankings';
import createRankingV2Handler from '@server/handlers/nft-collection-ranking/create-ranking/V2/create-ranking-v2.handler';
import { NFTCollectionRanking } from '@server/models/nft-collection-ranking';
import timer from '@server/utils/timer';
import { WithId } from 'mongodb';

jest.mock('@server/data/rankings');
const rankingsFindOneMock = rankings.findOne as jest.Mock;

const getContractMetadataMock = jest.fn();
const getNFTsForCollectionMock = jest.fn();
const getNFTMetadataMock = jest.fn();
jest.mock('@server/alchemy-api/nft-api/alchemy-nft-api', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getContractMetadata: getContractMetadataMock,
      getNFTsForCollection: getNFTsForCollectionMock,
      getNFTMetadata: getNFTMetadataMock,
    };
  });
});

jest.mock('@server/utils/timer');
const timerMock = timer as jest.Mock;

jest.mock('@server/data/helpers/ranking-insert-or-update');
const rankingInsertOrUpdateMock = rankingInsertOrUpdate as jest.Mock;

const rankingsFindOneMockResponse = {
  _id: '_id',
  accuracy: 90,
} as WithId<NFTCollectionRanking>;

const getContractMetadataMockResponse = {
  address: 'address',
  contractMetadata: {
    totalSupply: '4',
    tokenType: 'ERC21',
  },
} as GetContractMetadata;

describe('createRankingV2Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getNFTsForCollectionMock.mockResolvedValue(getNFTForCollectionResponse);
    getNFTMetadataMock.mockResolvedValue(getNFTMetadataResponse);
    timerMock.mockResolvedValue(true);
    rankingInsertOrUpdateMock.mockResolvedValue(true);
  });

  it('returns error response when accuracy for collection is already at 100%', async () => {
    const rankingsFindOneMockResponse = {
      _id: '_id',
      contractMetadata: { totalSupply: undefined, tokenType: undefined },
      accuracy: 100,
    } as WithId<NFTCollectionRanking>;

    rankingsFindOneMock.mockResolvedValue(rankingsFindOneMockResponse);

    const result = await createRankingV2Handler('conttractAddress');

    expect(result).toEqual({
      error:
        'Accuracy is already at 100% for this collection, no need to re-rank this collection',
    });
  });

  it.each([[undefined], ['']])(
    'returns empty response when totalSupply is %p',
    async (totalSupply: string | undefined) => {
      rankingsFindOneMock.mockResolvedValue(rankingsFindOneMockResponse);

      const mockResponse = {
        address: 'address',
        contractMetadata: {
          totalSupply,
          tokenType: undefined,
        },
      } as GetContractMetadata;
      getContractMetadataMock.mockResolvedValue(mockResponse);

      const result = await createRankingV2Handler('conttractAddress');

      expect(result).toEqual({});
    }
  );

  it.each([[undefined], ['']])(
    'returns empty response when tokenType is %p',
    async (tokenType: string | undefined) => {
      rankingsFindOneMock.mockResolvedValue(rankingsFindOneMockResponse);

      const mockResponse = {
        address: 'address',
        contractMetadata: {
          totalSupply: '5',
          tokenType,
        },
      } as GetContractMetadata;
      getContractMetadataMock.mockResolvedValue(mockResponse);

      const result = await createRankingV2Handler('conttractAddress');

      expect(result).toEqual({});
    }
  );

  it('returns an error when valid collection nfts is less than 70% of totalSupply', async () => {
    getNFTsForCollectionMock.mockResolvedValue({
      ...getNFTForCollectionResponse,
      nfts: [
        ...getNFTForCollectionResponse.nfts.slice(0, 1),
        {
          id: {
            tokenId:
              '0x0000000000000000000000000000000000000000000000000000000000000006',
            tokenMetadata: { tokenType: 'ERC721' },
          },
          metadata: { attributes: [] },
        },
        {
          id: {
            tokenId:
              '0x0000000000000000000000000000000000000000000000000000000000000007',
            tokenMetadata: { tokenType: 'ERC721' },
          },
          metadata: { attributes: [] },
        },
      ],
    });

    getNFTMetadataMock.mockResolvedValue({
      ...getNFTMetadataResponse,
      metadata: { attributes: [] },
    });

    rankingsFindOneMock.mockResolvedValue(rankingsFindOneMockResponse);
    getContractMetadataMock.mockResolvedValue(getContractMetadataMockResponse);

    const result = await createRankingV2Handler('contractAddress');

    expect(result).toEqual({
      error: `Accuracy for fetched collection NFTs was 50%, should be over 70%. Please try to create a ranking at a later time.`,
    });
  });

  it('returns an error when valid collection nfts after individual nft refetch is less than 95', async () => {
    getNFTsForCollectionMock.mockResolvedValue({
      ...getNFTForCollectionResponse,
      nfts: [
        ...getNFTForCollectionResponse.nfts.slice(0, 3),
        {
          id: {
            tokenId:
              '0x0000000000000000000000000000000000000000000000000000000000000006',
            tokenMetadata: { tokenType: 'ERC721' },
          },
          metadata: { attributes: [] },
        },
      ],
    });

    // Before each function returns an NFT that does not match the one above with tokenId 6

    rankingsFindOneMock.mockResolvedValue(rankingsFindOneMockResponse);
    getContractMetadataMock.mockResolvedValue(getContractMetadataMockResponse);

    const result = await createRankingV2Handler('contractAddress');

    expect(result).toEqual({
      error:
        'Ranking accuracy was 75%. Should be at least 95%. Please try to create a ranking at a later time',
    });
  });

  it('returns successful response with accuracy', async () => {
    getNFTsForCollectionMock.mockResolvedValue(getNFTForCollectionResponse);

    rankingsFindOneMock.mockResolvedValue(rankingsFindOneMockResponse);
    getContractMetadataMock.mockResolvedValue(getContractMetadataMockResponse);

    const result = await createRankingV2Handler('contractAddress');

    expect(result).toEqual({
      accuracy: 100,
      error: undefined,
    });
  });

  it('returns successful response after successfully refetching an NFT that was invalid', async () => {
    getNFTsForCollectionMock.mockResolvedValue({
      ...getNFTForCollectionResponse,
      nfts: [
        ...getNFTForCollectionResponse.nfts.slice(0, 3),
        {
          id: {
            tokenId:
              '0x0000000000000000000000000000000000000000000000000000000000000006',
            tokenMetadata: { tokenType: 'ERC721' },
          },
          metadata: { attributes: [] },
        },
      ],
    });

    getNFTMetadataMock.mockResolvedValueOnce({
      ...getNFTMetadataResponse,
      id: {
        tokenId:
          '0x0000000000000000000000000000000000000000000000000000000000000006',
      },
    });

    rankingsFindOneMock.mockResolvedValue(rankingsFindOneMockResponse);
    getContractMetadataMock.mockResolvedValue(getContractMetadataMockResponse);

    const result = await createRankingV2Handler('contractAddress');

    expect(result).toEqual({
      accuracy: 100,
      error: undefined,
    });
  });
});

const getNFTMetadataResponse = {
  contract: { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' },
  id: {
    tokenId:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    tokenMetadata: { tokenType: 'ERC721' },
  },
  title: '',
  description: '',
  tokenUri: {
    raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0',
    gateway:
      'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0',
  },
  metadata: {
    image: 'ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ',
    attributes: [
      { trait_type: 'Earring', value: 'Silver Hoop' },
      { trait_type: 'Background', value: 'Orange' },
      { trait_type: 'Fur', value: 'Robot' },
      { trait_type: 'Clothes', value: 'Striped Tee' },
      { trait_type: 'Mouth', value: 'Discomfort' },
      { trait_type: 'Eyes', value: 'X Eyes' },
    ],
  },
  timeLastUpdated: '2022-09-23T16:24:25.424Z',
  contractMetadata: {
    name: 'BoredApeYachtClub',
    symbol: 'BAYC',
    totalSupply: '10000',
    tokenType: 'ERC721',
  },
} as NFT;

const getNFTForCollectionResponse = {
  nfts: [
    {
      contract: { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' },
      id: {
        tokenId:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        tokenMetadata: { tokenType: 'ERC721' },
      },
      title: '',
      description: '',
      tokenUri: {
        raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0',
        gateway:
          'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0',
      },
      metadata: {
        image: 'ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ',
        attributes: [
          { trait_type: 'Earring', value: 'Silver Hoop' },
          { trait_type: 'Background', value: 'Orange' },
          { trait_type: 'Fur', value: 'Robot' },
          { trait_type: 'Clothes', value: 'Striped Tee' },
          { trait_type: 'Mouth', value: 'Discomfort' },
          { trait_type: 'Eyes', value: 'X Eyes' },
        ],
      },
      timeLastUpdated: '2022-09-23T16:24:25.424Z',
      contractMetadata: {
        name: 'BoredApeYachtClub',
        symbol: 'BAYC',
        totalSupply: '10000',
        tokenType: 'ERC721',
      },
    },
    {
      contract: { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' },
      id: {
        tokenId:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        tokenMetadata: { tokenType: 'ERC721' },
      },
      title: '',
      description: '',
      tokenUri: {
        raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1',
        gateway:
          'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1',
      },
      metadata: {
        image: 'ipfs://QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi',
        attributes: [
          { trait_type: 'Mouth', value: 'Grin' },
          { trait_type: 'Clothes', value: 'Vietnam Jacket' },
          { trait_type: 'Background', value: 'Orange' },
          { trait_type: 'Eyes', value: 'Blue Beams' },
          { trait_type: 'Fur', value: 'Robot' },
        ],
      },
      timeLastUpdated: '2022-09-23T16:24:24.971Z',
      contractMetadata: {
        name: 'BoredApeYachtClub',
        symbol: 'BAYC',
        totalSupply: '10000',
        tokenType: 'ERC721',
      },
    },
    {
      contract: { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' },
      id: {
        tokenId:
          '0x0000000000000000000000000000000000000000000000000000000000000002',
        tokenMetadata: { tokenType: 'ERC721' },
      },
      title: '',
      description: '',
      tokenUri: {
        raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/2',
        gateway:
          'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/2',
      },
      metadata: {
        image: 'ipfs://QmcJYkCKK7QPmYWjp4FD2e3Lv5WCGFuHNUByvGKBaytif4',
        attributes: [
          { trait_type: 'Eyes', value: '3d' },
          { trait_type: 'Mouth', value: 'Bored Cigarette' },
          { trait_type: 'Fur', value: 'Robot' },
          { trait_type: 'Hat', value: "Sea Captain's Hat" },
          { trait_type: 'Background', value: 'Aquamarine' },
        ],
      },
      timeLastUpdated: '2022-09-23T16:24:25.178Z',
      contractMetadata: {
        name: 'BoredApeYachtClub',
        symbol: 'BAYC',
        totalSupply: '10000',
        tokenType: 'ERC721',
      },
    },
    {
      contract: { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' },
      id: {
        tokenId:
          '0x0000000000000000000000000000000000000000000000000000000000000003',
        tokenMetadata: { tokenType: 'ERC721' },
      },
      title: '',
      description: '',
      tokenUri: {
        raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/3',
        gateway:
          'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/3',
      },
      metadata: {
        image: 'ipfs://QmYxT4LnK8sqLupjbS6eRvu1si7Ly2wFQAqFebxhWntcf6',
        attributes: [
          { trait_type: 'Background', value: 'Purple' },
          { trait_type: 'Eyes', value: 'Bored' },
          { trait_type: 'Mouth', value: 'Tongue Out' },
          { trait_type: 'Clothes', value: 'Bone Necklace' },
          { trait_type: 'Fur', value: 'Cheetah' },
        ],
      },
      timeLastUpdated: '2022-09-23T16:24:25.182Z',
      contractMetadata: {
        name: 'BoredApeYachtClub',
        symbol: 'BAYC',
        totalSupply: '10000',
        tokenType: 'ERC721',
      },
    },
    {
      contract: { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' },
      id: {
        tokenId:
          '0x0000000000000000000000000000000000000000000000000000000000000004',
        tokenMetadata: { tokenType: 'ERC721' },
      },
      title: '',
      description: '',
      tokenUri: {
        raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/4',
        gateway:
          'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/4',
      },
      metadata: {
        image: 'ipfs://QmSg9bPzW9anFYc3wWU5KnvymwkxQTpmqcRSfYj7UmiBa7',
        attributes: [
          { trait_type: 'Clothes', value: 'Navy Striped Tee' },
          { trait_type: 'Mouth', value: 'Phoneme L' },
          { trait_type: 'Hat', value: 'Party Hat 2' },
          { trait_type: 'Fur', value: 'Golden Brown' },
          { trait_type: 'Eyes', value: 'Closed' },
          { trait_type: 'Background', value: 'Blue' },
        ],
      },
      timeLastUpdated: '2022-09-23T16:24:25.176Z',
      contractMetadata: {
        name: 'BoredApeYachtClub',
        symbol: 'BAYC',
        totalSupply: '10000',
        tokenType: 'ERC721',
      },
    },
  ],
  nextToken: undefined,
} as GetNFTsForCollection;
