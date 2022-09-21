import dbClient from './config/swap-ease-db-client';
import { MongoClient } from 'mongodb';
import { createServer } from './config/express';

require('dotenv').config();

const verifyEnvVariables = (keys: string[]) => {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (!(key in process.env) || !process.env[key]) {
      throw new Error(`Environment variable ${key} cannot be empty`);
    }
  }
};

const port = process.env.PORT || 8000;

verifyEnvVariables([
  'MONGO_DB_CONNECTION_STRING',
  'MONGO_DB_NAME',
  'ALCHEMY_API_KEY',
  'ALCHEMY_API_NFT_URL',
]);

async function startServer(db: MongoClient) {
  const app = createServer();

  app.listen(port, () => {
    console.log('Server is running on port', port);
  });

  const signalTraps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

  signalTraps.forEach((type) => {
    process.on(type, () => {
      console.log(`process.on ${type}`);

      db.close();
      process.exit(0);
    });
  });
}

dbClient
  .then((v) => {
    console.log('DB client connected');
    startServer(v);
  })
  .catch((reason) => {
    console.log(reason);
  });
