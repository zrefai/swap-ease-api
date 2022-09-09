import createRankingV2Handler from '../handlers/nft-collection-ranking/create-ranking/V2/create-ranking-v2.handler';
import createRankingHandler, {
  NFTCollectionRankingResponse,
} from '../handlers/nft-collection-ranking/create-ranking/V1/create-ranking.handler';
import getSortedRankingHandler from '../handlers/nft-collection-ranking/get-sorted-ranking/get-sorted-ranking.handler';

export interface IGetSortedRankingPayload {
  startIndex?: string;
}

export default class NFTCollectionRankingController {
  public async getSortedRanking(
    contractAddress: string,
    startIndex: string | undefined
  ) {
    if (contractAddress === undefined || contractAddress.length === 0) {
      throw new Error('getSortedRanking -- Contract address cannot be empty');
    }

    return getSortedRankingHandler(contractAddress, startIndex);
  }

  public async createRanking(
    contractAddress: string
  ): Promise<NFTCollectionRankingResponse> {
    if (contractAddress === undefined || contractAddress.length === 0) {
      throw new Error('createRanking -- Contract address cannot be empty');
    }

    return createRankingV2Handler(contractAddress);
  }
}
