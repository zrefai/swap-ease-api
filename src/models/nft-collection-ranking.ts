import { NFTContractMetadata } from '@server/alchemy-api/models/nft';
import { AuditModel } from '@server/data/audit-models';

export interface NFTCollectionRanking extends AuditModel {
  _id: string;
  contractAddress: string;
  contractMetadata: NFTContractMetadata;
  accuracy: number;
  traits: { [key: string]: { [key: string]: number } };
  traitScores: { [key: string]: { [key: string]: number } };
}
