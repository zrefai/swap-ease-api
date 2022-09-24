import NFTCollectionRankingController from '@server/controllers/nft-collection-ranking.controller';
import { NFTCollectionRankingResponse } from '@server/handlers/nft-collection-ranking/create-ranking/V1/create-ranking.handler';
import createRankingV2Handler from '@server/handlers/nft-collection-ranking/create-ranking/V2/create-ranking-v2.handler';
import getSortedRankingHandler, {
  NFTSortedRankingResponse,
} from '@server/handlers/nft-collection-ranking/get-sorted-ranking/get-sorted-ranking.handler';

jest.mock(
  '@server/handlers/nft-collection-ranking/get-sorted-ranking/get-sorted-ranking.handler'
);
const getSortedRankingHandlerMock = getSortedRankingHandler as jest.Mock;

jest.mock(
  '@server/handlers/nft-collection-ranking/create-ranking/V2/create-ranking-v2.handler'
);
const createRankingV2HandlerMock = createRankingV2Handler as jest.Mock;

describe('NFTCollectionRankingController', () => {
  const controller = new NFTCollectionRankingController();
  describe('getSortedRanking', () => {
    it('throws error when contract address is undefined', async () => {
      try {
        await controller.getSortedRanking(
          undefined as unknown as string,
          undefined
        );
      } catch (error) {
        expect(error).toEqual(
          new Error('getSortedRanking -- Contract address cannot be empty')
        );
      }
    });

    it('throws error when contract address length is 0', async () => {
      try {
        await controller.getSortedRanking('', undefined);
      } catch (error) {
        expect(error).toEqual(
          new Error('getSortedRanking -- Contract address cannot be empty')
        );
      }
    });

    it('returns successful response', async () => {
      getSortedRankingHandlerMock.mockResolvedValue(
        {} as NFTSortedRankingResponse
      );

      const response = await controller.getSortedRanking('0x0', undefined);

      expect(response).toEqual({} as NFTSortedRankingResponse);
    });
  });

  describe('createRanking', () => {
    it('throws error when contract address is undefined', async () => {
      try {
        await controller.createRanking(undefined as unknown as string);
      } catch (error) {
        expect(error).toEqual(
          new Error('createRanking -- Contract address cannot be empty')
        );
      }
    });

    it('throws error when contract address length is 0', async () => {
      try {
        await controller.createRanking('');
      } catch (error) {
        expect(error).toEqual(
          new Error('createRanking -- Contract address cannot be empty')
        );
      }
    });

    it('returns successful response', async () => {
      createRankingV2HandlerMock.mockResolvedValue(
        {} as NFTCollectionRankingResponse
      );

      const response = await controller.createRanking('0x0');

      expect(response).toEqual({} as NFTCollectionRankingResponse);
    });
  });
});
