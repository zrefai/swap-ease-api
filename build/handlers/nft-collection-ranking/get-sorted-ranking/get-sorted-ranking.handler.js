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
const rankings_1 = __importDefault(require("../../../data/rankings"));
const PAGE_COUNT = 30;
function getSortedRankingHandler(contractAddress, startIndex = '0') {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const startIndexNumber = parseInt(startIndex);
        const document = yield rankings_1.default.getSortedRanking(contractAddress, startIndexNumber, PAGE_COUNT);
        const totalSupply = ((_a = document === null || document === void 0 ? void 0 : document.contractMetadata) === null || _a === void 0 ? void 0 : _a.totalSupply)
            ? parseInt(document.contractMetadata.totalSupply)
            : undefined;
        if (totalSupply !== undefined) {
            const nextIndex = startIndexNumber + PAGE_COUNT;
            console.log(document === null || document === void 0 ? void 0 : document.sortedRanking.length);
            return {
                nfts: (_b = document === null || document === void 0 ? void 0 : document.sortedRanking) !== null && _b !== void 0 ? _b : [],
                nextIndex: nextIndex <= totalSupply ? nextIndex : undefined,
            };
        }
        return {
            nfts: [],
            nextIndex: undefined,
        };
    });
}
exports.default = getSortedRankingHandler;
