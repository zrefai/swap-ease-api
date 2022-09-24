export interface NFTRankAttribute {
  trait_type: string;
  value: string | null;
  score: number;
}

export interface NFTRankMetadata {
  image: string | undefined;
  external_url: string | undefined;
  background_color: string | undefined;
  name: string | undefined;
  description: string | undefined;
  attributes: NFTRankAttribute[];
}

export interface NFTRankTokenUri {
  raw: string;
  gateway: string;
}

export interface NFTRank {
  tokenId: string;
  totalScore: number;
  tokenUri: NFTRankTokenUri;
  metadata: NFTRankMetadata;
}
