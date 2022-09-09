"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.client = void 0;
const mongodb_1 = require("mongodb");
require('dotenv').config();
const mongoClientUrl = process.env.MONGO_DB_CONNECTION_STRING;
const mongoDbName = process.env.MONGO_DB_NAME;
if (mongoClientUrl === undefined) {
    throw new Error('MongoDB connection string is undefined');
}
exports.client = new mongodb_1.MongoClient(mongoClientUrl);
exports.db = exports.client.db(mongoDbName);
exports.default = exports.client.connect();
