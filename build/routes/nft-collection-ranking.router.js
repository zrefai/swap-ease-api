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
const express_1 = __importDefault(require("express"));
const nft_collection_ranking_controller_1 = __importDefault(require("../controllers/nft-collection-ranking.controller"));
const router = express_1.default.Router();
router.get('/getSortedRanking/:contractAddress/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const controller = new nft_collection_ranking_controller_1.default();
    const response = yield controller.getSortedRanking(req.params.contractAddress, (_a = req.query.startIndex) === null || _a === void 0 ? void 0 : _a.toString());
    return res.send(response);
}));
router.post('/createRanking/:contractAddress', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new nft_collection_ranking_controller_1.default();
    const response = yield controller.createRanking(req.params.contractAddress);
    return res.send(response);
}));
exports.default = router;
