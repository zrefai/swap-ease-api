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
const create_ranking_v2_handler_1 = __importDefault(require("../handlers/nft-collection-ranking/create-ranking/create-ranking-v2.handler"));
const get_sorted_ranking_handler_1 = __importDefault(require("../handlers/nft-collection-ranking/get-sorted-ranking/get-sorted-ranking.handler"));
class NFTCollectionRankingController {
    getSortedRanking(contractAddress, startIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (contractAddress === undefined || contractAddress.length === 0) {
                throw new Error('getSortedRanking -- Contract address cannot be empty');
            }
            return (0, get_sorted_ranking_handler_1.default)(contractAddress, startIndex);
        });
    }
    createRanking(contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            if (contractAddress === undefined || contractAddress.length === 0) {
                throw new Error('createRanking -- Contract address cannot be empty');
            }
            return (0, create_ranking_v2_handler_1.default)(contractAddress);
        });
    }
}
exports.default = NFTCollectionRankingController;
