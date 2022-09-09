export interface NFTContractResponse {
  address: string;
}

export interface NFTIdResponse {
  tokenId: string;
  tokenMetadata: {
    tokenType: string | undefined;
  };
}

export interface NFTTokenUriResponse {
  raw: string | undefined;
  gateway: string | undefined;
}

export interface NFTMetadataResponse {
  image: string | undefined;
  external_url: string | undefined;
  background_color: string | undefined;
  name: string | undefined;
  description: string | undefined;
  attributes:
    | [
        {
          trait_type: string;
          value: string;
        }
      ]
    | undefined;
  traits:
    | [
        {
          trait_type: string;
          value: string;
        }
      ]
    | undefined;
}

export interface NFTContractMetadataResponse {
  name: string | undefined;
  symbol: string | undefined;
  totalSupply: string | undefined;
  tokenType: string | undefined;
}

export interface NFTResponse {
  contract: NFTContractResponse;
  id: NFTIdResponse;
  title: string | undefined;
  description: string | undefined;
  tokenUri: NFTTokenUriResponse;
  metadata: NFTMetadataResponse | string;
  error: string | undefined;
  timeLastUpdated: string | undefined;
  contractMetadata: NFTContractMetadataResponse | undefined;
}
