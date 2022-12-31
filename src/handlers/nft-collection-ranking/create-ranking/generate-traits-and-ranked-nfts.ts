import { NFT } from '@server/alchemy-api/models/nft';
import { NFTRank, NFTRankAttribute } from '@server/models/nft-rank';

export function generateTraitsAndRankedNFTs(
  totalSupply: number,
  collection: NFT[]
): {
  rankedNFTs: NFTRank[];
  traits: { [key: string]: { [key: string]: number } };
} {
  const nftCollection = [...collection];
  const allTraitTypes = new Set();

  // Retrieve all trait types from the collection
  for (let i = 0; i < nftCollection.length; i++) {
    for (let j = 0; j < nftCollection[i].metadata.attributes.length; j++) {
      allTraitTypes.add(nftCollection[i].metadata.attributes[j].trait_type);
    }
  }

  const traitTypes = Array.from(allTraitTypes) as string[];
  const traits: { [key: string]: { [key: string]: number } } = {
    trait_count: {},
  };

  // Fill traits object
  for (let i = 0; i < nftCollection.length; i++) {
    const nftTraits = nftCollection[i].metadata.attributes.map(
      (a) => a.trait_type
    );
    const nftValues = nftCollection[i].metadata.attributes.map((a) => a.value);
    const numberOfTraits = nftTraits.length;

    // Count number of times NFTs have a specific attribute count per count
    if (traits.trait_count[numberOfTraits]) {
      traits.trait_count[numberOfTraits]++;
    } else {
      traits.trait_count[numberOfTraits] = 1;
    }

    // Count all traits NFT does have
    for (let j = 0; j < nftTraits.length; j++) {
      const currentTrait = nftTraits[j];
      const currentValue = nftValues[j];

      if (traits[currentTrait]) {
        if (traits[currentTrait][currentValue]) {
          traits[currentTrait][currentValue] += 1;
        } else {
          traits[currentTrait][currentValue] = 1;
        }
      } else {
        traits[currentTrait] = {};
        traits[currentTrait][currentValue] = 1;
      }
    }

    // Count all traits NFT does not have
    traitTypes
      .filter((traitType) => !nftTraits.includes(traitType))
      .forEach((absentTraitType) => {
        if (traits[absentTraitType]) {
          if (traits[absentTraitType].absent_count) {
            traits[absentTraitType].absent_count += 1;
          } else {
            traits[absentTraitType].absent_count = 1;
          }
        } else {
          traits[absentTraitType] = { absent_count: 1 };
        }
      });
  }

  const rankedNFTs: NFTRank[] = [];

  // Create score and store it
  for (let i = 0; i < nftCollection.length; i++) {
    const currentNFT = nftCollection[i];
    let totalScore = 0;

    if (currentNFT.metadata.attributes.length > 0) {
      const attributes = currentNFT.metadata.attributes;
      const newAttributes: NFTRankAttribute[] = [];

      // Create new attributes array with score for each attribute
      for (let j = 0; j < attributes.length; j++) {
        const rarityScore =
          1 /
          (traits[attributes[j].trait_type][attributes[j].value] / totalSupply);

        newAttributes.push({
          trait_type: attributes[j].trait_type,
          value: attributes[j].value.toString(),
          score: rarityScore,
        });
        totalScore += rarityScore;
      }

      // Fill in attributes that are missing
      const currentAttributeTypes = newAttributes.map((a) => a.trait_type);
      traitTypes
        .filter((trait_type) => !currentAttributeTypes.includes(trait_type))
        .forEach((trait_type) => {
          const rarityScoreNull =
            1 / (traits[trait_type].absent_count / totalSupply);
          newAttributes.push({
            trait_type: trait_type,
            value: null,
            score: rarityScoreNull,
          });
          totalScore += rarityScoreNull;
        });

      // Push attribute for number of attributes (i.e trait_count)
      const rarityScoreForNumTraits =
        1 / (traits.trait_count[Object.keys(attributes).length] / totalSupply);
      newAttributes.push({
        trait_type: 'trait_count',
        value: Object.keys(attributes).length.toString(),
        score: rarityScoreForNumTraits,
      });
      totalScore += rarityScoreForNumTraits;

      const newRank: NFTRank = {
        tokenUri: {
          raw: currentNFT.tokenUri.raw,
          gateway: currentNFT.tokenUri.gateway,
        },
        metadata: {
          image: currentNFT.metadata.image,
          external_url: currentNFT.metadata.external_url,
          background_color: currentNFT.metadata.background_color,
          name: currentNFT.metadata.name,
          description: currentNFT.metadata.description,
          attributes: newAttributes,
        },
        totalScore,
        tokenId: parseInt(currentNFT.id.tokenId, 16).toString(),
      };

      rankedNFTs.push(newRank);
    } else {
      const newRank: NFTRank = {
        tokenUri: {
          raw: currentNFT.tokenUri.raw,
          gateway: currentNFT.tokenUri.gateway,
        },
        metadata: {
          image: currentNFT.metadata.image,
          external_url: currentNFT.metadata.external_url,
          background_color: currentNFT.metadata.background_color,
          name: currentNFT.metadata.name,
          description: currentNFT.metadata.description,
          attributes: [],
        },
        totalScore: totalScore,
        tokenId: parseInt(currentNFT.id.tokenId, 16).toString(),
      };

      rankedNFTs.push(newRank);
    }
  }

  return {
    rankedNFTs,
    traits,
  };
}
