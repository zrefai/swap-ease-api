"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.client = void 0;
const mongodb_1 = require("mongodb");
const mongoClientUrl = 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGO_DB_NAME;
// if (mongoClientUrl === undefined) {
//   throw new Error('Mongo client url is undefined');
// }
// if (mongoDbName === undefined) {
//   throw new Error('Mongo client name is undefined');
// }
exports.client = new mongodb_1.MongoClient(mongoClientUrl);
exports.db = exports.client.db(mongoDbName);
exports.default = exports.client.connect();
