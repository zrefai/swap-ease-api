process.env = {
  ...process.env,
  ENVIRONMENT: 'development',
  PORT: '8000',
  ALCHEMY_API_KEY: 'api_key',
  ALCHEMY_API_NFT_URL: 'https://eth-mainnet.g.alchemy.com/nft/v2',
  MONGO_DB_CONNECTION_STRING: 'mongo_db_connection_string',
  MONGO_DB_NAME: 'swapEase',
};

jest.mock('@server/config/swap-ease-db-client', () => jest.fn());
