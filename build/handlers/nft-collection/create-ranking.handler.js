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
const alchemy_nft_api_1 = __importDefault(require("../../alchemy-api/nft-api/alchemy-nft-api"));
const rankings_1 = __importDefault(require("../../data/rankings"));
const timer_1 = __importDefault(require("../../utils/timer"));
function createRankingHandler(contractAddress) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const alchemyNftApi = new alchemy_nft_api_1.default();
        const currentNfts = yield alchemyNftApi.getNFTsForCollection({
            contractAddress,
        });
        const collection = [...currentNfts.nfts];
        const contractMetadata = collection[0].contractMetadata;
        const totalSupply = (contractMetadata === null || contractMetadata === void 0 ? void 0 : contractMetadata.totalSupply)
            ? parseInt(contractMetadata.totalSupply)
            : undefined;
        if (contractMetadata && totalSupply !== undefined) {
            let nextToken = currentNfts.nextToken;
            // Retrieve all nfts in a collection
            while (nextToken != undefined) {
                const nextNfts = yield alchemyNftApi.getNFTsForCollection({
                    contractAddress,
                    startToken: nextToken,
                });
                collection.push(...nextNfts.nfts);
                nextToken = nextNfts.nextToken;
                yield (0, timer_1.default)(1000);
            }
            console.log('Collection retrieved');
            const traits = {};
            let validNfts = totalSupply;
            for (let i = 0; i < collection.length; ++i) {
                const nft = collection[i];
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
                    const updatedNFT = yield alchemyNftApi.getNFTMetadata({
                        contractAddress: (_a = nft.contract) === null || _a === void 0 ? void 0 : _a.address,
                        tokenId: nft.id.tokenId,
                        tokenType: nft.id.tokenMetadata.tokenType,
                    });
                    if (nft.metadata.attributes.length > 0) {
                        updatedNFT.metadata.attributes.forEach((attribute) => {
                            if (attribute.value in traits) {
                                traits[attribute.value] += 1;
                            }
                            else {
                                traits[attribute.value] = 1;
                            }
                        });
                    }
                    else {
                        validNfts -= 1;
                    }
                    yield (0, timer_1.default)(1000);
                }
                if (i % 1000 === 0) {
                    console.log(`Processed ${i} out of ${totalSupply} NFTs`);
                }
            }
            console.log('Traits created');
            const accuracy = (validNfts / totalSupply) * 100;
            if (accuracy < 95) {
                return {
                    error: `Ranking accuracy was ${accuracy}. Should be at least 95. Please try to create a ranking at a later time`,
                };
            }
            const traitScores = {};
            // Create score for each trait
            Object.keys(traits).forEach((key) => {
                traitScores[key] = 1 / (traits[key] / totalSupply);
            });
            const sortedRanking = assignAndSort(traitScores, collection);
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
                throw new Error(`Could not add new collection ranking for ${contractMetadata.name}: ${accuracy}% accuracy`);
            }
            return {
                contractAddress,
                contractMetadata,
                accuracy,
                error: undefined,
                sortedRanking: sortedRanking.slice(0, 30),
            };
        }
        return {
            error: 'Contract metadata was not properly retrieved',
        };
    });
}
exports.default = createRankingHandler;
function assignAndSort(traitScores, fullCollection) {
    const assignedNftScores = fullCollection.map((nft) => {
        if (nft.metadata.attributes.length > 0) {
            return {
                tokenId: parseInt(nft.id.tokenId, 16).toString(),
                score: nft.metadata.attributes.reduce((prev, curr) => {
                    return prev + traitScores[curr.value];
                }, 0),
            };
        }
        return {
            tokenId: nft.id.tokenId,
            score: 0,
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
