import { db } from '@server/config/swap-ease-db-client';
import { NFTSortedRanking } from '@server/models/nft-sorted-ranking';
import { Collection, WithId } from 'mongodb';

const getCollection = () =>
  db.collection('sortedRankings') as Collection<NFTSortedRanking>;

export const insertOne = async (
  document: NFTSortedRanking
): Promise<boolean> => {
  const result = await getCollection().insertOne(document);
  return result?.insertedId?.toString()?.length > 0;
};

export const findOne = async (
  contractAddress: string
): Promise<WithId<NFTSortedRanking> | null> => {
  return await getCollection().findOne({ contractAddress });
};

export const updateOne = async (document: NFTSortedRanking) => {
  const updatedResult = getCollection().updateOne(
    {
      contractAddress: document.contractAddress,
    },
    {
      $set: {
        sortedRanking: document.sortedRanking,
      },
    }
  );
  return updatedResult;
};

export const getSortedRankings = async (
  contractAddress: string,
  startIndex: number,
  pageCount: number
): Promise<WithId<NFTSortedRanking> | null> => {
  const slicedSortedRanking = await getCollection()
    .find(
      { contractAddress },
      {
        projection: {
          sortedRanking: {
            $slice: [startIndex, pageCount],
          },
        },
      }
    )
    .toArray();

  return slicedSortedRanking[0];
};

export default {
  insertOne,
  findOne,
  updateOne,
  getSortedRankings,
};
