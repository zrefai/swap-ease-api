import express from 'express';
import NFTCollectionRankingRouter from './nft-collection-ranking.router';

const router = express.Router();

router.use('/nftCollection', NFTCollectionRankingRouter);

export default router;
