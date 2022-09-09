"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_chunk_1 = __importDefault(require("lodash.chunk"));
const alchemy_nft_api_1 = __importDefault(require("../../../alchemy-api/nft-api/alchemy-nft-api"));
const rankings_1 = __importDefault(require("../../../data/rankings"));
function createRankingV2Handler(contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const alchemyNftApi = new alchemy_nft_api_1.default();
        const contractMetadataResponse = yield alchemyNftApi.getContractMetadata({
            contractAddress,
        });
        const totalSupply = contractMetadataResponse.contractMetadata.totalSupply !== undefined
            ? parseInt(contractMetadataResponse.contractMetadata.totalSupply)
            : undefined;
        const tokenType = contractMetadataResponse.contractMetadata.tokenType;
        if (totalSupply !== undefined && totalSupply !== 0 && tokenType) {
            const chunkedPromises = batchCollectionPromises(contractAddress, totalSupply, alchemyNftApi);
            const nfts = yield resolveCollectionPromises(chunkedPromises);
            const traits = {};
            let validNFTs = totalSupply;
            const toRefetch = [];
            // Count traits, accuracy, and nfts to refetch
            const keys = Object.keys(nfts);
            for (let i = 0; i < keys.length; ++i) {
                const nft = nfts[keys[i]];
                if (nft.metadata.attributes.length > 0) {
                    nft.metadata.attributes.forEach((attribute) => {
                        if (attribute.value in traits) {
                            traits[attribute.value] += 1;
                        }
                        else {
                            traits[attribute.value] = 1;
                        }
                    });
                }
                else {
                    function requestNFT() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return yield alchemyNftApi.getNFTMetadata({
                                contractAddress,
                                tokenId: keys[i],
                                tokenType: tokenType,
                            });
                        });
                    }
                    toRefetch.push(requestNFT());
                    validNFTs -= 1;
                }
            }
            const batchedNFTsToRefetch = (0, lodash_chunk_1.default)(toRefetch, 10);
            function refetchMissingNFTs(batchedNFTPromises, depth = 0) {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log(batchedNFTPromises);
                    if (batchedNFTPromises.length === 0 || depth > 4) {
                        return;
                    }
                    const newNFTsToRefetch = [];
                    for (let i = 0; i < batchedNFTPromises.length; ++i) {
                        const resolvedNFTs = yield Promise.all(batchedNFTPromises[i]);
                        for (let i = 0; i < resolvedNFTs.length; ++i) {
                            const value = resolvedNFTs[i];
                            console.log(value);
                            if (value.metadata.attributes.length > 0) {
                                value.metadata.attributes.forEach((attribute) => {
                                    if (attribute.value in traits) {
                                        traits[attribute.value] += 1;
                                    }
                                    else {
                                        traits[attribute.value] = 1;
                                    }
                                });
                                validNFTs += 1;
                                nfts[value.id.tokenId] = value;
                            }
                            else if (value.id.tokenId && value.id.tokenMetadata.tokenType) {
                                function requestNFT() {
                                    return __awaiter(this, void 0, void 0, function* () {
                                        return yield alchemyNftApi.getNFTMetadata({
                                            contractAddress,
                                            tokenId: value.id.tokenId,
                                            tokenType: value.id.tokenMetadata.tokenType,
                                        });
                                    });
                                }
                                newNFTsToRefetch.push(requestNFT());
                            }
                        }
                        // await Promise.all(batchedNFTPromises[i]).then((data: NFT[]) => {
                        //   for (let i = 0; i < data.length; ++i) {
                        //     const value = data[i];
                        //     if (value.metadata.attributes.length > 0) {
                        //       value.metadata.attributes.forEach((attribute: NFTAttribute) => {
                        //         if (attribute.value in traits) {
                        //           traits[attribute.value] += 1;
                        //         } else {
                        //           traits[attribute.value] = 1;
                        //         }
                        //       });
                        //       validNFTs += 1;
                        //       nfts[value.id.tokenId] = value;
                        //     } else if (value.id.tokenId && value.id.tokenMetadata.tokenType) {
                        //       async function requestNFT() {
                        //         return await alchemyNftApi.getNFTMetadata({
                        //           contractAddress,
                        //           tokenId: value.id.tokenId,
                        //           tokenType: value.id.tokenMetadata.tokenType,
                        //         });
                        //       }
                        //       newNFTsToRefetch.push(requestNFT());
                        //     }
                        //   }
                        // });
                    }
                    const newBatchedNFTsToRefetch = (0, lodash_chunk_1.default)(newNFTsToRefetch, 10);
                    yield refetchMissingNFTs(newBatchedNFTsToRefetch, depth + 1);
                });
            }
            yield refetchMissingNFTs(batchedNFTsToRefetch);
            const accuracy = parseFloat(((validNFTs / totalSupply) * 100).toFixed(3));
            if (accuracy < 95) {
                return {
                    error: `Ranking accuracy was ${accuracy}. Should be at least 95. Please try to create a ranking at a later time`,
                };
            }
            const traitScores = {};
            // Create score for each trait
            Object.keys(traits).forEach((key) => {
                traitScores[key] = parseFloat((1 / (traits[key] / totalSupply)).toFixed(3));
            });
            const sortedRanking = assignAndSort(traitScores, Object.values(nfts));
            const contractMetadata = {
                name: contractMetadataResponse === null || contractMetadataResponse === void 0 ? void 0 : contractMetadataResponse.contractMetadata.name,
                symbol: contractMetadataResponse === null || contractMetadataResponse === void 0 ? void 0 : contractMetadataResponse.contractMetadata.symbol,
                tokenType: contractMetadataResponse === null || contractMetadataResponse === void 0 ? void 0 : contractMetadataResponse.contractMetadata.tokenType,
                totalSupply: totalSupply.toString(),
            };
            const newNFTCollectionRanking = {
                contractAddress,
                contractMetadata,
                accuracy,
                traits,
                traitScores,
                sortedRanking,
            };
            const isInserted = yield rankings_1.default.insertOne(newNFTCollectionRanking);
            if (!isInserted) {
                return {
                    error: `Could not add new collection ranking for ${contractMetadata === null || contractMetadata === void 0 ? void 0 : contractMetadata.name}: ${accuracy}% accuracy`,
                };
            }
            return {
                accuracy,
                error: undefined,
            };
        }
        return {};
    });
}
exports.default = createRankingV2Handler;
function batchCollectionPromises(contractAddress, totalSupply, api) {
    const promises = [];
    for (let i = 1; i < totalSupply; i += 100) {
        function requestCollection() {
            return __awaiter(this, void 0, void 0, function* () {
                return yield api.getNFTsForCollection({
                    contractAddress,
                    startToken: i.toString(),
                });
            });
        }
        promises.push(requestCollection());
    }
    return (0, lodash_chunk_1.default)(promises, 10);
}
function resolveCollectionPromises(chunkedPromises) {
    return __awaiter(this, void 0, void 0, function* () {
        const nfts = [];
        for (let i = 0; i < chunkedPromises.length; i++) {
            const reducedNFTs = yield Promise.all(chunkedPromises[i]).then((data) => {
                return data.reduce((prev, curr) => {
                    prev.push(...curr.nfts);
                    return prev;
                }, []);
            });
            nfts.push(...reducedNFTs);
        }
        const reducedNFTs = {};
        nfts.forEach((nft) => (reducedNFTs[nft.id.tokenId] = nft));
        return reducedNFTs;
    });
}
function assignAndSort(traitScores, fullCollection) {
    const assignedNftScores = fullCollection.map((nft) => {
        if (nft.metadata.attributes.length > 0) {
            return {
                tokenId: parseInt(nft.id.tokenId, 16).toString(),
                score: nft.metadata.attributes.reduce((prev, curr) => {
                    return prev + traitScores[curr.value];
                }, 0),
                attributes: nft.metadata.attributes,
            };
        }
        return {
            tokenId: parseInt(nft.id.tokenId, 16).toString(),
            score: 0,
            attributes: [],
        };
    });
    return mergeSort(assignedNftScores);
}
function merge(left, right) {
    let arr = [];
    while (left.length && right.length) {
        if (left[0].score > right[0].score) {
            const shiftedRank = left.shift();
            if (shiftedRank !== undefined) {
                arr.push(shiftedRank);
            }
        }
        else {
            const shiftedRank = right.shift();
            if (shiftedRank !== undefined) {
                arr.push(shiftedRank);
            }
        }
    }
    return [...arr, ...left, ...right];
}
function mergeSort(array) {
    const half = array.length / 2;
    if (array.length < 2) {
        return array;
    }
    const left = array.splice(0, half);
    return merge(mergeSort(left), mergeSort(array));
}
