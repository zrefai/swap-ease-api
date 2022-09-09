import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import Router from '../routes';

const createServer = (): express.Application => {
  const app = express();

  app.use(express.json());
  app.use(morgan('tiny'));
  app.use(express.static('public'));

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
      swaggerOptions: {
        url: '/swagger.json',
      },
    })
  );

  app.use(Router);

  return app;
};

export { createServer };
