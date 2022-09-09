import { MongoClient } from 'mongodb';

require('dotenv').config();

const mongoClientUrl = process.env.MONGO_DB_CONNECTION_STRING;
const mongoDbName = process.env.MONGO_DB_NAME;

if (mongoClientUrl === undefined) {
  throw new Error('MongoDB connection string is undefined');
}

export const client = new MongoClient(mongoClientUrl);
export const db = client.db(mongoDbName);

export default client.connect();
