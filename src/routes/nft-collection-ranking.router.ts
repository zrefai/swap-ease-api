import express from 'express';
import NFTCollectionRankingController from '../controllers/nft-collection-ranking.controller';

const router = express.Router();

router.get('/getSortedRanking/:contractAddress/', async (req, res) => {
  const controller = new NFTCollectionRankingController();
  const response = await controller.getSortedRanking(
    req.params.contractAddress,
    req.query.startIndex?.toString()
  );
  return res.send(response);
});

router.post('/createRanking/:contractAddress', async (req, res) => {
  const controller = new NFTCollectionRankingController();
  const response = await controller.createRanking(req.params.contractAddress);
  return res.send(response);
});

export default router;
