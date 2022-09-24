import { TokenType } from '@server/alchemy-api/nft-api/alchemy-nft-api.interfaces';
import { generateTraitsAndRankedNFTs } from '@server/handlers/nft-collection-ranking/create-ranking/generate-traits-and-ranked-nfts';
import { collectionMock } from '@tests/mocks/get-collection-response-mock';
import { NFTRank } from '@server/models/nft-rank';

describe('generateTraitsAndRankedNFTs', () => {
  it('returns rankedNFTs', () => {
    const result = generateTraitsAndRankedNFTs(100, collectionMock);

    const ranked1: NFTRank = {
      tokenUri: {
        raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0',
        gateway:
          'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0',
      },
      metadata: {
        image: 'ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ',
        external_url: undefined,
        background_color: undefined,
        name: undefined,
        description: undefined,
        attributes: [
          {
            trait_type: 'Earring',
            value: 'Silver Hoop',
            score: 14.285714285714285,
          },
          {
            trait_type: 'Background',
            value: 'Orange',
            score: 6.666666666666667,
          },
          { trait_type: 'Fur', value: 'Robot', score: 16.666666666666668 },
          { trait_type: 'Clothes', value: 'Striped Tee', score: 50 },
          { trait_type: 'Mouth', value: 'Discomfort', score: 20 },
          { trait_type: 'Eyes', value: 'X Eyes', score: 33.333333333333336 },
          { trait_type: 'trait_count', value: '6', score: 1.8867924528301885 },
          { trait_type: 'Hat', value: null, score: 3.7037037037037033 },
        ],
      },
      totalScore: 146.54287710891484,
      tokenId: '0',
    };

    const ranked10: NFTRank = {
      tokenUri: {
        raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/9',
        gateway:
          'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/9',
      },
      metadata: {
        image: 'ipfs://QmUQgKka8EW7exiUHnMwZ4UoXA11wV7NFjHAogVAbasSYy',
        external_url: undefined,
        background_color: undefined,
        name: undefined,
        description: undefined,
        attributes: [
          {
            trait_type: 'Earring',
            value: 'Silver Stud',
            score: 16.666666666666668,
          },
          { trait_type: 'Eyes', value: 'Sleepy', score: 12.5 },
          {
            trait_type: 'Mouth',
            value: 'Small Grin',
            score: 33.333333333333336,
          },
          { trait_type: 'Fur', value: 'Brown', score: 7.692307692307692 },
          { trait_type: 'Hat', value: "Seaman's Hat", score: 20 },
          {
            trait_type: 'Clothes',
            value: 'Stunt Jacket',
            score: 16.666666666666668,
          },
          {
            trait_type: 'Background',
            value: 'Purple',
            score: 6.666666666666667,
          },
          { trait_type: 'trait_count', value: '7', score: 5.555555555555555 },
        ],
      },
      totalScore: 119.0811965811966,
      tokenId: '9',
    };

    const ranked20: NFTRank = {
      tokenUri: {
        raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/19',
        gateway:
          'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/19',
      },
      metadata: {
        image: 'ipfs://QmRcuopgwX16miSpLtEkY5kzZS96iwwNMWjMUaqUeyA619',
        external_url: undefined,
        background_color: undefined,
        name: undefined,
        description: undefined,
        attributes: [
          { trait_type: 'Eyes', value: 'Eyepatch', score: 20 },
          { trait_type: 'Fur', value: 'Tan', score: 16.666666666666668 },
          {
            trait_type: 'Background',
            value: 'Army Green',
            score: 7.142857142857142,
          },
          { trait_type: 'Hat', value: 'Bayc Hat Black', score: 100 },
          { trait_type: 'Mouth', value: 'Rage', score: 25 },
          { trait_type: 'trait_count', value: '5', score: 3.571428571428571 },
          { trait_type: 'Earring', value: null, score: 1.36986301369863 },
          { trait_type: 'Clothes', value: null, score: 8.333333333333334 },
        ],
      },
      totalScore: 182.08414872798434,
      tokenId: '19',
    };

    const ranked50: NFTRank = {
      tokenUri: {
        raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/49',
        gateway:
          'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/49',
      },
      metadata: {
        image: 'ipfs://QmSenFWfxwfEJKDTGe9hZbwGzkigy6V3Eby5fFkBguuWGG',
        external_url: undefined,
        background_color: undefined,
        name: undefined,
        description: undefined,
        attributes: [
          { trait_type: 'Fur', value: 'Cheetah', score: 16.666666666666668 },
          {
            trait_type: 'Earring',
            value: 'Silver Stud',
            score: 16.666666666666668,
          },
          {
            trait_type: 'Clothes',
            value: 'Bone Tee',
            score: 33.333333333333336,
          },
          {
            trait_type: 'Background',
            value: 'Purple',
            score: 6.666666666666667,
          },
          { trait_type: 'Hat', value: "Fisherman's Hat", score: 100 },
          { trait_type: 'Eyes', value: 'Bored', score: 6.25 },
          {
            trait_type: 'Mouth',
            value: 'Bored Unshaven Cigarette',
            score: 16.666666666666668,
          },
          { trait_type: 'trait_count', value: '7', score: 5.555555555555555 },
        ],
      },
      totalScore: 201.80555555555554,
      tokenId: '49',
    };

    const ranked100: NFTRank = {
      tokenUri: {
        raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/99',
        gateway:
          'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/99',
      },
      metadata: {
        image: 'ipfs://QmWiXSKwbwHkobDdZbDc6t66kf192P33Ru5UJYhL5mPJTk',
        external_url: undefined,
        background_color: undefined,
        name: undefined,
        description: undefined,
        attributes: [
          {
            trait_type: 'Clothes',
            value: 'Black Holes T',
            score: 16.666666666666668,
          },
          {
            trait_type: 'Background',
            value: 'Army Green',
            score: 7.142857142857142,
          },
          { trait_type: 'Hat', value: 'Sushi Chef Headband', score: 100 },
          { trait_type: 'Fur', value: 'Dark Brown', score: 7.142857142857142 },
          { trait_type: 'Eyes', value: 'Closed', score: 12.5 },
          { trait_type: 'Mouth', value: 'Grin', score: 10 },
          {
            trait_type: 'Earring',
            value: 'Silver Hoop',
            score: 14.285714285714285,
          },
          { trait_type: 'trait_count', value: '7', score: 5.555555555555555 },
        ],
      },
      totalScore: 173.29365079365078,
      tokenId: '99',
    };

    const expectedResults = [
      { index: 0, nft: ranked1 },
      { index: 9, nft: ranked10 },
      { index: 19, nft: ranked20 },
      { index: 49, nft: ranked50 },
      { index: 99, nft: ranked100 },
    ];

    expectedResults.forEach((value) => {
      const resultNFT = result.rankedNFTs[value.index];

      expect(value.nft.tokenId).toEqual(resultNFT.tokenId);
      expect(value.nft.totalScore).toEqual(resultNFT.totalScore);
      expect(value.nft.tokenUri.raw).toEqual(resultNFT.tokenUri.raw);
      expect(value.nft.tokenUri.gateway).toEqual(resultNFT.tokenUri.gateway);
      expect(value.nft.metadata.background_color).toEqual(
        resultNFT.metadata.background_color
      );
      expect(value.nft.metadata.description).toEqual(
        resultNFT.metadata.description
      );
      expect(value.nft.metadata.external_url).toEqual(
        resultNFT.metadata.external_url
      );
      expect(value.nft.metadata.image).toEqual(resultNFT.metadata.image);
      expect(value.nft.metadata.name).toEqual(resultNFT.metadata.name);

      resultNFT.metadata.attributes.forEach((attribute, index) => {
        expect(attribute.score).toEqual(
          value.nft.metadata.attributes[index].score
        );
        expect(attribute.trait_type).toEqual(
          value.nft.metadata.attributes[index].trait_type
        );
        expect(attribute.value).toEqual(
          value.nft.metadata.attributes[index].value
        );
      });
    });
  });

  it('returns traits', () => {
    const result = generateTraitsAndRankedNFTs(100, collectionMock);

    const expectedTraits: { [key: string]: { [key: string]: number } } = {
      trait_count: { '4': 1, '5': 28, '6': 53, '7': 18 },
      Earring: {
        total_count: 27,
        'Silver Hoop': 7,
        'Gold Stud': 7,
        'Silver Stud': 6,
        'Diamond Stud': 2,
        Cross: 2,
        'Gold Hoop': 3,
      },
      Background: {
        total_count: 100,
        Orange: 15,
        Aquamarine: 13,
        Purple: 15,
        Blue: 15,
        'Army Green': 14,
        Yellow: 12,
        Gray: 7,
        'New Punk Blue': 9,
      },
      Fur: {
        total_count: 100,
        Robot: 6,
        Cheetah: 6,
        'Golden Brown': 4,
        Brown: 13,
        Cream: 5,
        Zombie: 6,
        Dmt: 2,
        'Dark Brown': 14,
        Black: 11,
        Gray: 7,
        Tan: 6,
        Trippy: 1,
        Red: 5,
        'Death Bot': 3,
        Blue: 4,
        Pink: 5,
        'Solid Gold': 1,
        White: 1,
      },
      Clothes: {
        total_count: 88,
        'Striped Tee': 2,
        'Vietnam Jacket': 3,
        'Bone Necklace': 4,
        'Navy Striped Tee': 8,
        'Bayc T Red': 4,
        'Tweed Suit': 4,
        'Wool Turtleneck': 3,
        'Stunt Jacket': 6,
        'Smoking Jacket': 1,
        'Black Holes T': 6,
        'Bone Tee': 3,
        Tanktop: 3,
        'Black T': 2,
        'Bayc T Black': 3,
        Bandolier: 1,
        'Tuxedo Tee': 3,
        Guayabera: 4,
        'Sleeveless T': 2,
        'Hip Hop': 2,
        'Sailor Shirt': 3,
        'Leather Jacket': 2,
        'Biker Vest': 2,
        'Lumberjack Shirt': 4,
        'Prison Jumpsuit': 2,
        'Work Vest': 2,
        'Blue Dress': 1,
        Toga: 1,
        'Lab Coat': 2,
        'Cowboy Shirt': 1,
        Service: 1,
        Hawaiian: 1,
        'Admirals Coat': 1,
        'Pimp Coat': 1,
      },
      Mouth: {
        total_count: 100,
        Discomfort: 5,
        Grin: 10,
        'Bored Cigarette': 11,
        'Tongue Out': 2,
        'Phoneme L': 3,
        Dumbfounded: 6,
        Bored: 20,
        'Small Grin': 3,
        'Bored Unshaven Cigarette': 6,
        'Bored Unshaven': 13,
        Rage: 4,
        'Phoneme Vuh': 2,
        'Phoneme  ooo': 4,
        'Bored Pipe': 1,
        Jovial: 3,
        'Bored Pizza': 1,
        'Phoneme Wah': 2,
        'Grin Multicolored': 1,
        'Bored Unshaven Cigar': 1,
        'Bored Dagger': 1,
        'Bored Unshaven Kazoo': 1,
      },
      Eyes: {
        total_count: 100,
        'X Eyes': 3,
        'Blue Beams': 1,
        '3d': 9,
        Bored: 16,
        Closed: 8,
        Crazy: 2,
        Angry: 3,
        Robot: 2,
        Sleepy: 8,
        Eyepatch: 5,
        Bloodshot: 6,
        'Wide Eyed': 4,
        Coins: 7,
        Zombie: 1,
        Cyborg: 2,
        Hypnotized: 2,
        Holographic: 1,
        Sunglasses: 5,
        Sad: 7,
        Heart: 4,
        Scumbag: 3,
        Blindfold: 1,
      },
      Hat: {
        total_count: 73,
        "Sea Captain's Hat": 3,
        'Party Hat 2': 2,
        'Bayc Flipped Brim': 3,
        'S&m Hat': 4,
        'Stuntman Helmet': 2,
        Beanie: 7,
        "Seaman's Hat": 5,
        'Bayc Hat Red': 2,
        'Laurel Wreath': 1,
        'Police Motorcycle Helmet': 1,
        "Girl's Hair Pink": 2,
        Horns: 4,
        'Commie Hat': 5,
        'Bayc Hat Black': 1,
        Fez: 7,
        'Army Hat': 2,
        Halo: 1,
        Bowler: 4,
        'Spinner Hat': 2,
        "Baby's Bonnet": 2,
        "Fisherman's Hat": 1,
        "Girl's Hair Short": 2,
        "King's Crown": 1,
        'Bunny Ears': 3,
        'Ww2 Pilot Helm': 3,
        'Bandana Blue': 1,
        'Prussian Helmet': 1,
        'Sushi Chef Headband': 1,
      },
    };

    const expectedNFTTraitTypes = Object.keys(expectedTraits);

    Object.keys(result.traits).map((key, index) => {
      const expectedKey = expectedNFTTraitTypes[index];
      expect(key).toEqual(expectedKey);

      Object.keys(result.traits[key]).map((subKey) => {
        expect(result.traits[key][subKey]).toEqual(
          expectedTraits[expectedKey][subKey]
        );
      });
    });
  });

  it('returns NFTRank with no score if attributes length is zero', () => {
    const result = generateTraitsAndRankedNFTs(100, [
      {
        contract: { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D' },
        id: {
          tokenId:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          tokenMetadata: { tokenType: TokenType.ERC721 },
        },
        title: '',
        description: '',
        error: undefined,
        tokenUri: {
          raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0',
          gateway:
            'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0',
        },
        metadata: {
          image: 'ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ',
          external_url: undefined,
          background_color: undefined,
          name: undefined,
          description: undefined,
          attributes: [],
        },
        timeLastUpdated: '2022-09-23T16:24:25.424Z',
        contractMetadata: {
          name: 'BoredApeYachtClub',
          symbol: 'BAYC',
          totalSupply: '10000',
          tokenType: 'ERC721',
        },
      },
    ]);

    const expectedResult: NFTRank[] = [
      {
        totalScore: 0,
        tokenId: '0',
        tokenUri: {
          raw: 'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0',
          gateway:
            'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0',
        },
        metadata: {
          image: 'ipfs://QmRRPWG96cmgTn2qSzjwr2qvfNEuhunv6FNeMFGa9bx6mQ',
          external_url: undefined,
          background_color: undefined,
          name: undefined,
          description: undefined,
          attributes: [],
        },
      },
    ];

    result.rankedNFTs.forEach((value, index) => {
      expect(value.tokenId).toEqual(expectedResult[index].tokenId);
      expect(value.totalScore).toEqual(expectedResult[index].totalScore);
      expect(value.tokenUri.raw).toEqual(expectedResult[index].tokenUri.raw);
      expect(value.tokenUri.gateway).toEqual(
        expectedResult[index].tokenUri.gateway
      );
      expect(value.metadata.background_color).toEqual(
        expectedResult[index].metadata.background_color
      );
      expect(value.metadata.description).toEqual(
        expectedResult[index].metadata.description
      );
      expect(value.metadata.external_url).toEqual(
        expectedResult[index].metadata.external_url
      );
      expect(value.metadata.image).toEqual(
        expectedResult[index].metadata.image
      );
      expect(value.metadata.name).toEqual(expectedResult[index].metadata.name);

      expect(value.metadata.attributes.length).toEqual(
        expectedResult[index].metadata.attributes.length
      );
    });
  });
});
