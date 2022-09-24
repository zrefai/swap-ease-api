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

    for (let j = 0; j < nftTraits.length; j++) {
      const currentTrait = nftTraits[j];
      const currentValue = nftValues[j];

      if (traits[currentTrait]) {
        if (traits[currentTrait][currentValue]) {
          traits[currentTrait].total_count += 1;
          traits[currentTrait][currentValue] += 1;
        } else {
          traits[currentTrait].total_count += 1;
          traits[currentTrait][currentValue] = 1;
        }
      } else {
        traits[currentTrait] = { total_count: 1 };
        traits[currentTrait][currentValue] = 1;
      }
    }
  }

  const rankedNFTs: NFTRank[] = [];
  const numberOfTraitTypes = Object.keys(traits);

  // Create score and store it
  for (let i = 0; i < nftCollection.length; i++) {
    const currentNFT = nftCollection[i];
    let totalRarity = 0;

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
        totalRarity += rarityScore;
      }

      // Push attribute for number of attributes
      const rarityScoreForNumTraits =
        1 / (traits.trait_count[Object.keys(attributes).length] / totalSupply);
      newAttributes.push({
        trait_type: 'trait_count',
        value: Object.keys(attributes).length.toString(),
        score: rarityScoreForNumTraits,
      });
      totalRarity += rarityScoreForNumTraits;

      // Fill in attributes that are missing
      if (attributes.length < numberOfTraitTypes.length) {
        const currentAttributeTypes = newAttributes.map((a) => a.trait_type);
        const absentTypes = numberOfTraitTypes.filter(
          (trait_type) => !currentAttributeTypes.includes(trait_type)
        );

        absentTypes.forEach((trait_type) => {
          const rarityScoreNull =
            1 / ((totalSupply - traits[trait_type].total_count) / totalSupply);
          newAttributes.push({
            trait_type: trait_type,
            value: null,
            score: rarityScoreNull,
          });
          totalRarity += rarityScoreNull;
        });
      }

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
        totalScore: totalRarity,
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
        totalScore: totalRarity,
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
