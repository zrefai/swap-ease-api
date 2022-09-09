import express from 'express';
import NFTCollectionRankingRouter from './nft-collection-ranking.router';
import PingController from '../controllers/ping-controller';

const router = express.Router();

router.get('/ping', async (_req, res) => {
  const controller = new PingController();
  const response = await controller.getMessage();
  return res.send(response);
});

router.use('/nftCollection', NFTCollectionRankingRouter);

export default router;
