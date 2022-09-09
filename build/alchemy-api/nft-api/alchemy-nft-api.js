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
exports.TokenType = void 0;
const call_with_retry_1 = __importDefault(require("../utils/call-with-retry"));
const get_nft_metadata_mapper_1 = require("./mappers/get-nft-metadata-mapper");
const get_nfts_for_collection_mapper_1 = require("./mappers/get-nfts-for-collection-mapper");
var TokenType;
(function (TokenType) {
    TokenType["ERC721"] = "ERC721";
    TokenType["ERC1155"] = "ERC1155";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
const START_TOKEN = '0x0000000000000000000000000000000000000000000000000000000000000001';
class AlchemyNFTApi {
    initialize() {
        if (process.env.ALCHEMY_API_KEY === undefined) {
            throw new Error('Api Key is not valid');
        }
        if (process.env.ALCHEMY_API_NFT_URL === undefined) {
            throw new Error('Alchemy NFT url not valid');
        }
        this.apiKey = process.env.ALCHEMY_API_KEY;
        this.alchemySdk = require('api')('@alchemy-docs/v1.0#rjin63ol75h86y9');
        this.alchemySdk.server(process.env.ALCHEMY_API_NFT_URL);
    }
    getContractMetadata({ contractAddress, }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialize();
            try {
                const response = yield this.alchemySdk.getContractMetadata({ contractAddress });
                return response;
            }
            catch (error) {
                console.log(error);
                throw new Error('getContractMetadata -- Something went wrong');
            }
        });
    }
    getNFTsForCollection({ contractAddress, withMetadata = 'true', startToken = START_TOKEN, }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialize();
            const callback = () => __awaiter(this, void 0, void 0, function* () {
                return yield this.alchemySdk.getNFTsForCollection({
                    contractAddress,
                    withMetadata,
                    startToken,
                    apiKey: this.apiKey,
                });
            });
            const response = yield (0, call_with_retry_1.default)(callback);
            return (0, get_nfts_for_collection_mapper_1.getNFTsForCollectionMapper)(response);
        });
    }
    getNFTMetadata({ contractAddress, tokenId, tokenType, refreshCache = false, }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.initialize();
            if (tokenId === undefined) {
                throw new Error('getNFTMetadata -- TokenId is undefined');
            }
            if (tokenType === undefined) {
                throw new Error('getNFTMetadata -- TokenType is undefined');
            }
            const callback = () => __awaiter(this, void 0, void 0, function* () {
                return yield this.alchemySdk.getNFTMetadata({
                    contractAddress,
                    tokenId,
                    tokenType,
                    refreshCache,
                    apiKey: this.apiKey,
                });
            });
            const response = yield (0, call_with_retry_1.default)(callback);
            return (0, get_nft_metadata_mapper_1.getNFTMetadataMapper)(response);
        });
    }
}
exports.default = AlchemyNFTApi;
