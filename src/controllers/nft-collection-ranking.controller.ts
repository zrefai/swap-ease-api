import createRankingV2Handler, {
  NFTCollectionRankingResponse,
} from '@server/handlers/nft-collection-ranking/create-ranking/V2/create-ranking-v2.handler';
import getSortedRankingHandler, {
  NFTSortedRankingResponse,
} from '@server/handlers/nft-collection-ranking/get-sorted-ranking/get-sorted-ranking.handler';

export interface IGetSortedRankingPayload {
  startIndex?: string;
}

export default class NFTCollectionRankingController {
  public async getSortedRanking(
    contractAddress: string,
    startIndex: string | undefined
  ): Promise<NFTSortedRankingResponse> {
    if (contractAddress === undefined || contractAddress.length === 0) {
      throw new Error('getSortedRanking -- Contract address cannot be empty');
    }

    return await getSortedRankingHandler(contractAddress, startIndex);
  }

  public async createRanking(
    contractAddress: string
  ): Promise<NFTCollectionRankingResponse> {
    if (contractAddress === undefined || contractAddress.length === 0) {
      throw new Error('createRanking -- Contract address cannot be empty');
    }

    return await createRankingV2Handler(contractAddress);
  }
}
