// Docs for transactions https://www.mongodb.com/docs/manual/reference/method/Session.startTransaction/

import { client } from '@server/config/swap-ease-db-client';
import { NFTCollectionRanking } from '@server/models/nft-collection-ranking';
import { NFTSortedRanking } from '@server/models/nft-sorted-ranking';
import { WithId, ClientSession } from 'mongodb';
import rankings from '../rankings';
import sortedRankings from '../sorted-rankings';

export async function rankingInsertOrUpdate(
  storedAccuracy: WithId<NFTCollectionRanking> | null,
  rankingDocument: NFTCollectionRanking,
  sortedRankingDocument: NFTSortedRanking
) {
  const session = client.startSession();

  try {
    if (storedAccuracy === null) {
      await runTransationWithRetry(insertRankings);
    } else if (rankingDocument.accuracy > storedAccuracy.accuracy) {
      await runTransationWithRetry(updateRankings);
    }
  } catch (error: any) {
    throw new Error(error);
  } finally {
    console.log('Session ended');
    session.endSession();
  }

  async function insertRankings() {
    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    });

    try {
      await rankings.insertOne(rankingDocument);
      await sortedRankings.insertOne(sortedRankingDocument);
    } catch (error) {
      console.log('Caught exception during insert transaction, aborting.');
      await session.abortTransaction();
      throw error;
    }

    commitWithRetry(session);
  }

  async function updateRankings() {
    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    });

    try {
      await rankings.updateOne(rankingDocument);
      await sortedRankings.updateOne(sortedRankingDocument);
    } catch (error) {
      console.log('Caught exception during update transaction, aborting.');
      await session.abortTransaction();
      throw error;
    }

    commitWithRetry(session);
  }
}

async function runTransationWithRetry(txnFunc: () => Promise<void>) {
  while (true) {
    try {
      await txnFunc(); // performs transaction
      break;
    } catch (error: any) {
      // If transient errorm retry the whole function
      if (
        error.hasOwnProperty('errorLabels') &&
        error.errorLabels.includes('TransientTransactionError')
      ) {
        console.log('TransientTransactionError, retrying transaction ...');
        continue;
      } else {
        throw error;
      }
    }
  }
}

async function commitWithRetry(session: ClientSession) {
  while (true) {
    try {
      await session.commitTransaction(); // Uses write concern set at transaction start
      console.log('Transaction committed');
      break;
    } catch (error: any) {
      // Can retry commit
      if (
        error.hasOwnProperty('errorLabels') &&
        error.errorLabels.includes('UnknownTransactionCommitResult')
      ) {
        console.log(
          'UnknownTransactionCommitResult, retrying commit operation ...'
        );
        continue;
      } else {
        console.log('Error during commit ...');
        throw error;
      }
    }
  }
}
