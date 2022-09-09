import { NFTContractMetadata } from '../alchemy-api/models/nft';
import { AuditModel } from '../data/audit-models';
import { NFTRank } from './nft-rank';

export interface NFTCollectionRanking extends AuditModel {
  _id: string;
  contractAddress: string;
  contractMetadata: NFTContractMetadata;
  accuracy: number;
  traits: { [key: string]: number };
  traitScores: { [key: string]: number };
  sortedRanking: NFTRank[];
}
