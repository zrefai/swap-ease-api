import express from 'express';
import morgan from 'morgan';
import Router from '../routes';

const createServer = (): express.Application => {
  const app = express();

  app.use(express.json());
  app.use(morgan('tiny'));
  app.use(express.static('public'));

  app.use(Router);

  return app;
};

export { createServer };
