import {
  // NFT,
  // NFTAttribute,
  NFTContractMetadata,
} from '@server/alchemy-api/models/nft';
// import AlchemyNFTApi from '@server/alchemy-api/nft-api/alchemy-nft-api';
// import { TokenType } from '@server/alchemy-api/nft-api/alchemy-nft-api.interfaces';
// import rankings from '@server/data/rankings';
// import { NFTCollectionRanking } from '@server/models/nft-collection-ranking';
import { NFTRank } from '@server/models/nft-rank';
// import timer from '@server/utils/timer';
// import { mergeSort } from '../merge-sort';

export interface NFTCollectionRankingResponse {
  contractAddress: string;
  contractMetadata: NFTContractMetadata;
  accuracy: number;
  error: string | undefined;
  sortedRanking: NFTRank[];
}

// export default async function createRankingHandler(
//   contractAddress: string
// ): Promise<NFTCollectionRankingResponse> {
//   const alchemyNftApi = new AlchemyNFTApi();

//   const currentNfts = await alchemyNftApi.getNFTsForCollection({
//     contractAddress,
//   });
//   const collection = [...currentNfts.nfts];

//   let nextToken: string | undefined = currentNfts.nextToken;

//   // Retrieve all nfts in a collection
//   while (nextToken != undefined) {
//     const nextNfts = await alchemyNftApi.getNFTsForCollection({
//       contractAddress,
//       startToken: nextToken,
//     });

//     collection.push(...nextNfts.nfts);

//     nextToken = nextNfts.nextToken;

//     await timer(1000);
//   }

//   console.log('Collection retrieved');

//   const traits: { [key: string]: number } = {};

//   const totalSupply = collection.length;
//   let validNfts = totalSupply;

//   for (let i = 0; i < collection.length; ++i) {
//     const nft = collection[i];

//     if (nft.metadata.attributes.length > 0) {
//       nft.metadata.attributes.forEach((attribute: NFTAttribute) => {
//         if (attribute.value in traits) {
//           traits[attribute.value] += 1;
//         } else {
//           traits[attribute.value] = 1;
//         }
//       });
//     } else {
//       const updatedNFT = await alchemyNftApi.getNFTMetadata({
//         contractAddress: nft.contract?.address,
//         tokenId: nft.id.tokenId,
//         tokenType: nft.id.tokenMetadata.tokenType as TokenType,
//       });
//       if (nft.metadata.attributes.length > 0) {
//         updatedNFT.metadata.attributes.forEach((attribute: NFTAttribute) => {
//           if (attribute.value in traits) {
//             traits[attribute.value] += 1;
//           } else {
//             traits[attribute.value] = 1;
//           }
//         });
//       } else {
//         validNfts -= 1;
//       }
//       await timer(1000);
//     }

//     if (i % 1000 === 0) {
//       console.log(`Processed ${i} out of ${totalSupply} NFTs`);
//     }
//   }

//   console.log('Traits created');

//   const accuracy = (validNfts / totalSupply) * 100;
//   if (accuracy < 95) {
//     return {
//       error: `Ranking accuracy was ${accuracy}. Should be at least 95. Please try to create a ranking at a later time`,
//     } as NFTCollectionRankingResponse;
//   }

//   const traitScores: { [key: string]: number } = {};

//   // Create score for each trait
//   Object.keys(traits).forEach((key: string) => {
//     traitScores[key] = 1 / (traits[key] / totalSupply);
//   });

//   const sortedRanking = assignAndSort(traitScores, collection);

//   const contractMetadataResponse = collection[0].contractMetadata;
//   const contractMetadata: NFTContractMetadata = {
//     name: contractMetadataResponse?.name,
//     symbol: contractMetadataResponse?.symbol,
//     tokenType: contractMetadataResponse?.tokenType,
//     totalSupply: totalSupply.toString(),
//   };

//   const newNFTCollectionRanking: Partial<NFTCollectionRanking> = {
//     contractAddress,
//     contractMetadata,
//     accuracy,
//     // traits,
//     // traitScores,
//     // sortedRanking,
//   };

//   const isInserted = await rankings.insertOne(
//     newNFTCollectionRanking as NFTCollectionRanking
//   );

//   if (!isInserted) {
//     return {
//       error: `Could not add new collection ranking for ${contractMetadata?.name}: ${accuracy}% accuracy`,
//     } as NFTCollectionRankingResponse;
//   }

//   return {
//     contractAddress,
//     contractMetadata,
//     accuracy,
//     error: undefined,
//     sortedRanking: sortedRanking.slice(0, 30),
//   } as NFTCollectionRankingResponse;
// }

// function assignAndSort(
//   traitScores: { [key: string]: number },
//   fullCollection: NFT[]
// ): NFTRank[] {
//   const assignedNftScores: NFTRank[] = fullCollection.map((nft: NFT) => {
//     if (nft.metadata.attributes.length > 0) {
//       return {
//         metdata: {},
//         tokenId: parseInt(nft.id.tokenId, 16).toString(),
//         totalScore: nft.metadata.attributes.reduce(
//           (prev: number, curr: Record<string, any>) => {
//             return prev + traitScores[curr.value];
//           },
//           0
//         ),
//         attributes: nft.metadata.attributes,
//       };
//     }
//     return {
//       metdata: {},
//       tokenId: parseInt(nft.id.tokenId, 16).toString(),
//       totalScore: 0,
//       attributes: [],
//     };
//   });

//   return mergeSort(assignedNftScores);
// }
