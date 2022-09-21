import { db } from '@server/config/swap-ease-db-client';
import { NFTCollectionRanking } from '@server/models/nft-collection-ranking';
import { Collection, WithId, UpdateResult } from 'mongodb';
import auditModels from './audit-models';

const getCollection = () =>
  db.collection('rankings') as Collection<NFTCollectionRanking>;

export const insertOne = async (
  document: NFTCollectionRanking
): Promise<boolean> => {
  const result = await auditModels.insertOne(getCollection(), document);
  return result?.insertedId?.toString()?.length > 0;
};

export const findOne = async (
  contractAddress: string
): Promise<WithId<NFTCollectionRanking> | null> => {
  return await getCollection().findOne({ contractAddress });
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
        dateUpdatedUtc: new Date(),
      },
    }
  );

  return updatedResult;
};

export default {
  insertOne,
  findOne,
  updateOne,
};
