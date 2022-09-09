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
exports.getSortedRanking = exports.updateOne = exports.findOne = exports.insertOne = void 0;
const swap_ease_db_client_1 = require("../config/swap-ease-db-client");
const audit_models_1 = __importDefault(require("./audit-models"));
const getCollection = () => swap_ease_db_client_1.db.collection('rankings');
const insertOne = (document) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const collection = getCollection();
    const currentRanking = yield (0, exports.findOne)(document.contractAddress);
    if (currentRanking === null) {
        const result = yield audit_models_1.default.insertOne(collection, document);
        return ((_b = (_a = result === null || result === void 0 ? void 0 : result.insertedId) === null || _a === void 0 ? void 0 : _a.toString()) === null || _b === void 0 ? void 0 : _b.length) > 0;
    }
    else if (document.accuracy > currentRanking.accuracy) {
        const updatedResult = yield (0, exports.updateOne)(document);
        return ((_d = (_c = updatedResult.upsertedId) === null || _c === void 0 ? void 0 : _c.toString()) === null || _d === void 0 ? void 0 : _d.length) > 0;
    }
    return false;
});
exports.insertOne = insertOne;
const findOne = (contractAddress, getSortedRanking = 0) => __awaiter(void 0, void 0, void 0, function* () {
    return yield getCollection().findOne({ contractAddress }, { projection: { sortedRanking: getSortedRanking } });
});
exports.findOne = findOne;
const updateOne = (document) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedResult = getCollection().updateOne({ contractAddress: document.contractAddress }, {
        traits: document.traits,
        traitScores: document.traitScores,
        accuracy: document.accuracy,
        sortedRanking: document.sortedRanking,
        dateUpdatedUtc: new Date(),
    }, { upsert: true });
    return updatedResult;
});
exports.updateOne = updateOne;
const getSortedRanking = (contractAddress, startIndex, pageCount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Getting $slice [${startIndex}, ${startIndex + pageCount}]`);
    const slicedSortedRanking = yield getCollection()
        .find({ contractAddress }, {
        projection: {
            contractMetadata: 1,
            sortedRanking: {
                $slice: [startIndex, pageCount],
            },
        },
    })
        .toArray();
    return slicedSortedRanking[0];
});
exports.getSortedRanking = getSortedRanking;
exports.default = {
    insertOne: exports.insertOne,
    findOne: exports.findOne,
    updateOne: exports.updateOne,
    getSortedRanking: exports.getSortedRanking,
};
