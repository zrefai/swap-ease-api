import { NFTContractMetadata } from '@server/alchemy-api/models/nft';
import rankings from '@server/data/rankings';
import sortedRankings from '@server/data/sorted-rankings';
import getSortedRankingHandler, {
  NFTSortedRankingResponse,
} from '@server/handlers/nft-collection-ranking/get-sorted-ranking/get-sorted-ranking.handler';
import { NFTCollectionRanking } from '@server/models/nft-collection-ranking';
import { NFTSortedRanking } from '@server/models/nft-sorted-ranking';
import { WithId } from 'mongodb';

jest.mock('@server/data/rankings');
const rankingFindOneMock = rankings.findOne as jest.Mock;

jest.mock('@server/data/sorted-rankings');
const sortedRankingsGetSortedRankingsMock =
  sortedRankings.getSortedRankings as jest.Mock;

const contractMetadataMock = {
  totalSupply: '9999',
} as NFTContractMetadata;

const currentRankingMock: Partial<WithId<NFTCollectionRanking>> = {
  _id: 'contract_address',
  contractAddress: 'contract_address',
  contractMetadata: contractMetadataMock,
};

const currentDocument = {
  _id: 'contract_address',
  contractAddress: 'contract_address',
  sortedRanking: [
    {
      tokenId: '1',
      totalScore: 0.09,
      metadata: {
        attributes: [{ trait_type: 'coat', value: 'fur', score: 0 }],
      },
    },
    {
      tokenId: '1',
      totalScore: 0.1,
      metadata: {
        attributes: [{ trait_type: 'coat', value: 'sig', score: 0 }],
      },
    },
  ],
} as WithId<NFTSortedRanking>;

const PAGE_COUNT = 30;

describe('getSortedRankingHandler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('throws error when ranking to find is null (ranking doesnt exist in DB)', async () => {
    rankingFindOneMock.mockResolvedValue(null);

    try {
      await getSortedRankingHandler('0x0');
    } catch (error) {
      expect(error).toEqual(
        new Error(
          "Cannot get ranking for collection that hasn't been processed yet"
        )
      );
    }

    expect(rankingFindOneMock).toHaveBeenCalledTimes(1);
  });

  it('throws error when document is null (couldnt find ranking in DB)', async () => {
    rankingFindOneMock.mockResolvedValue(currentRankingMock);

    sortedRankingsGetSortedRankingsMock.mockResolvedValue(null);

    try {
      await getSortedRankingHandler('0x0');
    } catch (error) {
      expect(error).toEqual(
        new Error(
          'Document returned null when trying to get a sorted ranking from the DB'
        )
      );
    }

    expect(rankingFindOneMock).toHaveBeenCalledTimes(1);
    expect(sortedRankingsGetSortedRankingsMock).toHaveBeenCalledTimes(1);
  });

  it('returns with valid response', async () => {
    rankingFindOneMock.mockResolvedValue(currentRankingMock);

    sortedRankingsGetSortedRankingsMock.mockResolvedValue(currentDocument);

    const response = await getSortedRankingHandler('0x0');

    const expectedResult: NFTSortedRankingResponse = {
      nfts: currentDocument.sortedRanking,
      nextIndex: PAGE_COUNT,
    };

    expect(response).toEqual(expectedResult);
  });

  it('returns expected response when totalSupply is undefined', async () => {
    rankingFindOneMock.mockResolvedValue({
      ...currentRankingMock,
      contractMetadata: {
        totalSupply: undefined,
      },
    });

    sortedRankingsGetSortedRankingsMock.mockResolvedValue(currentDocument);

    const response = await getSortedRankingHandler('0x0');

    const expectedResult: NFTSortedRankingResponse = {
      nfts: [],
      nextIndex: undefined,
    };

    expect(response).toEqual(expectedResult);
  });

  it('returns expected page count', async () => {
    rankingFindOneMock.mockResolvedValue(currentRankingMock);

    sortedRankingsGetSortedRankingsMock.mockResolvedValue(currentDocument);

    const response = await getSortedRankingHandler('0x0', '30');

    expect(response.nextIndex).toEqual(30 + PAGE_COUNT);
  });

  it('returns undefined page count when nextIndex is greater than totalSupply', async () => {
    rankingFindOneMock.mockResolvedValue(currentRankingMock);

    sortedRankingsGetSortedRankingsMock.mockResolvedValue(currentDocument);

    const response = await getSortedRankingHandler('0x0', '9995');

    expect(response.nextIndex).toEqual(undefined);
  });
});
