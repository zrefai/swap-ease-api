import { Collection, InsertOneResult, OptionalUnlessRequiredId } from 'mongodb';

export interface AuditModel {
  dateAddedUtc: Date;
  dateUpdatedUtc: Date;
}

const insertOne = async <T extends AuditModel>(
  collection: Collection<T>,
  document: T
): Promise<InsertOneResult<T>> => {
  const currentDate = new Date();
  document.dateAddedUtc = currentDate;
  document.dateUpdatedUtc = currentDate;
  return await collection.insertOne(document as OptionalUnlessRequiredId<T>);
};

export default {
  insertOne,
};
