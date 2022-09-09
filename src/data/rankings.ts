import { Collection, UpdateResult, WithId } from 'mongodb';
import { db } from '../config/swap-ease-db-client';
import { NFTCollectionRanking } from '../models/nft-collection-ranking';
import auditModels from './audit-models';

const getCollection = () =>
  db.collection('rankings') as Collection<NFTCollectionRanking>;

export const insertOne = async (
  document: NFTCollectionRanking
): Promise<boolean> => {
  const collection = getCollection();
  const currentRanking = await findOne(document.contractAddress);

  if (currentRanking === null) {
    const result = await auditModels.insertOne(collection, document);
    return result?.insertedId?.toString()?.length > 0;
  } else if (document.accuracy > currentRanking.accuracy) {
    const updatedResult = await updateOne(document);
    return updatedResult.upsertedId?.toString()?.length > 0;
  }

  return false;
};

export const findOne = async (
  contractAddress: string,
  getSortedRanking = 0
): Promise<WithId<NFTCollectionRanking> | null> => {
  return await getCollection().findOne(
    { contractAddress },
    { projection: { sortedRanking: getSortedRanking } }
  );
};

export const updateOne = async (
  document: NFTCollectionRanking
): Promise<UpdateResult> => {
  const updatedResult = getCollection().updateOne(
    { contractAddress: document.contractAddress },
    {
      $set: {
        traits: document.traits,
        traitScores: document.traitScores,
        accuracy: document.accuracy,
        sortedRanking: document.sortedRanking,
        dateUpdatedUtc: new Date(),
      },
    }
  );

  return updatedResult;
};

export const getSortedRanking = async (
  contractAddress: string,
  startIndex: number,
  pageCount: number
): Promise<WithId<NFTCollectionRanking> | null> => {
  const slicedSortedRanking = await getCollection()
    .find(
      { contractAddress },
      {
        projection: {
          contractMetadata: 1,
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
  getSortedRanking,
};
