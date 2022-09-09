"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNFTsForCollectionMapper = void 0;
function getNFTsForCollectionMapper(nftCollectionResponse) {
    var _a;
    const nfts = (_a = nftCollectionResponse === null || nftCollectionResponse === void 0 ? void 0 : nftCollectionResponse.nfts) === null || _a === void 0 ? void 0 : _a.map((nftResponse) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const metadata = mapMetadata(nftResponse.metadata);
        return {
            contract: {
                address: (_a = nftResponse.contract) === null || _a === void 0 ? void 0 : _a.address,
            },
            id: {
                tokenId: nftResponse.id.tokenId,
                tokenMetadata: {
                    tokenType: nftResponse.id.tokenMetadata.tokenType,
                },
            },
            title: nftResponse.title,
            description: nftResponse.description,
            tokenUri: {
                raw: (_b = nftResponse.tokenUri.raw) !== null && _b !== void 0 ? _b : '',
                gateway: (_c = nftResponse.tokenUri.gateway) !== null && _c !== void 0 ? _c : '',
            },
            metadata,
            error: nftResponse.error,
            timeLastUpdated: nftResponse.timeLastUpdated,
            contractMetadata: {
                name: (_d = nftResponse.contractMetadata) === null || _d === void 0 ? void 0 : _d.name,
                symbol: (_e = nftResponse.contractMetadata) === null || _e === void 0 ? void 0 : _e.symbol,
                totalSupply: (_g = (_f = nftResponse.contractMetadata) === null || _f === void 0 ? void 0 : _f.totalSupply) !== null && _g !== void 0 ? _g : '0',
                tokenType: (_h = nftResponse.contractMetadata) === null || _h === void 0 ? void 0 : _h.tokenType,
            },
        };
    });
    const nftCollection = {
        nfts,
        nextToken: nftCollectionResponse === null || nftCollectionResponse === void 0 ? void 0 : nftCollectionResponse.nextToken,
    };
    return nftCollection;
}
exports.getNFTsForCollectionMapper = getNFTsForCollectionMapper;
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
        metaData.image = metaDataResponse.image;
        metaData.background_color = metaDataResponse.background_color;
        metaData.description = metaDataResponse.description;
        metaData.external_url = metaDataResponse.external_url;
        metaData.name = metaDataResponse.name;
        metaData.attributes = metaDataResponse.attributes
            ? metaDataResponse.attributes.map((attribute) => {
                return {
                    trait_type: attribute.trait_type,
                    value: attribute.value,
                };
            })
            : metaDataResponse.traits
                ? metaDataResponse.traits.map((attribute) => {
                    return {
                        trait_type: attribute.trait_type,
                        value: attribute.value,
                    };
                })
                : [];
    }
    return metaData;
}
