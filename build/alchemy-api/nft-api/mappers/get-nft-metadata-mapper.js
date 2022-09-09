"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNFTMetadataMapper = void 0;
function getNFTMetadataMapper(nftMetadataResponse) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const metadata = mapMetadata(nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.metadata);
    return {
        contract: {
            address: (_a = nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.contract) === null || _a === void 0 ? void 0 : _a.address,
        },
        id: {
            tokenId: nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.id.tokenId,
            tokenMetadata: {
                tokenType: nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.id.tokenMetadata.tokenType,
            },
        },
        title: nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.title,
        description: nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.description,
        tokenUri: {
            raw: (_b = nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.tokenUri.raw) !== null && _b !== void 0 ? _b : '',
            gateway: (_c = nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.tokenUri.gateway) !== null && _c !== void 0 ? _c : '',
        },
        metadata,
        error: nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.error,
        timeLastUpdated: nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.timeLastUpdated,
        contractMetadata: {
            name: (_d = nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.contractMetadata) === null || _d === void 0 ? void 0 : _d.name,
            symbol: (_e = nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.contractMetadata) === null || _e === void 0 ? void 0 : _e.symbol,
            totalSupply: (_g = (_f = nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.contractMetadata) === null || _f === void 0 ? void 0 : _f.totalSupply) !== null && _g !== void 0 ? _g : '0',
            tokenType: (_h = nftMetadataResponse === null || nftMetadataResponse === void 0 ? void 0 : nftMetadataResponse.contractMetadata) === null || _h === void 0 ? void 0 : _h.tokenType,
        },
    };
}
exports.getNFTMetadataMapper = getNFTMetadataMapper;
function mapMetadata(metaDataResponse) {
    const metaData = {};
    if (typeof metaDataResponse === 'string') {
        metaData.image = undefined;
        metaData.background_color = undefined;
        metaData.description = undefined;
        metaData.external_url = undefined;
        metaData.name = undefined;
        metaData.attributes = [];
    }
    else {
        metaData.image = metaDataResponse === null || metaDataResponse === void 0 ? void 0 : metaDataResponse.image;
        metaData.background_color = metaDataResponse === null || metaDataResponse === void 0 ? void 0 : metaDataResponse.background_color;
        metaData.description = metaDataResponse === null || metaDataResponse === void 0 ? void 0 : metaDataResponse.description;
        metaData.external_url = metaDataResponse === null || metaDataResponse === void 0 ? void 0 : metaDataResponse.external_url;
        metaData.name = metaDataResponse === null || metaDataResponse === void 0 ? void 0 : metaDataResponse.name;
        metaData.attributes = (metaDataResponse === null || metaDataResponse === void 0 ? void 0 : metaDataResponse.attributes)
            ? metaDataResponse === null || metaDataResponse === void 0 ? void 0 : metaDataResponse.attributes.map((attribute) => {
                return {
                    trait_type: attribute.trait_type,
                    value: attribute.value,
                };
            })
            : (metaDataResponse === null || metaDataResponse === void 0 ? void 0 : metaDataResponse.traits)
                ? metaDataResponse === null || metaDataResponse === void 0 ? void 0 : metaDataResponse.traits.map((attribute) => {
                    return {
                        trait_type: attribute.trait_type,
                        value: attribute.value,
                    };
                })
                : [];
    }
    return metaData;
}
