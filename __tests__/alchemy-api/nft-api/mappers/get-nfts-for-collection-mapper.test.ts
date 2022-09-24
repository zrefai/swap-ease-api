import { GetNFTsForCollectionResponse } from '@server/alchemy-api/models/responses/get-nfts-for-collection-response';
import { getNFTMetadataMapper } from '@server/alchemy-api/nft-api/mappers/get-nft-metadata-mapper';
import { getNFTsForCollectionMapper } from '@server/alchemy-api/nft-api/mappers/get-nfts-for-collection-mapper';

jest.mock('@server/alchemy-api/nft-api/mappers/get-nft-metadata-mapper');
const getNFTDataMapperMock = getNFTMetadataMapper as jest.Mock;

const nftCollectionResponseMock: GetNFTsForCollectionResponse = {
  nfts: [],
  nextToken: '30',
};

describe('getNFTsForCollectionMapper', () => {
  beforeEach(() => {
    getNFTDataMapperMock.mockReturnValue([]);
  });

  it('gets next token from response', () => {
    const result = getNFTsForCollectionMapper(nftCollectionResponseMock, true);

    expect(result).toEqual({ nfts: [], nextToken: '30' });
  });

  it('gets next token from response when it is undefined', () => {
    const result = getNFTsForCollectionMapper(
      { nfts: [] } as unknown as GetNFTsForCollectionResponse,
      true
    );

    expect(result).toEqual({ nfts: [], nextToken: undefined });
  });

  it('gets nft tokenId when metadata is false', () => {
    const result = getNFTsForCollectionMapper(
      {
        nfts: [{ id: { tokenId: '1' } }, { id: { tokenId: '2' } }],
        nextToken: '30',
      } as GetNFTsForCollectionResponse,
      false
    );

    expect(result).toEqual({
      nfts: [
        {
          id: {
            tokenId: '1',
          },
        },
        { id: { tokenId: '2' } },
      ],
      nextToken: '30',
    });
  });
});
