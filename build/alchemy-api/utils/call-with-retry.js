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
const timer_1 = __importDefault(require("../../utils/timer"));
function callWithRetry(fn, depth = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fn();
        }
        catch (error) {
            if (depth > 7) {
                throw error;
            }
            const errorResponse = error;
            if (errorResponse.status === 429) {
                yield (0, timer_1.default)(Math.pow(2, depth) * 1000 + (Math.floor(Math.random() * 1000) + 1));
                return callWithRetry(fn, depth + 1);
            }
        }
    });
}
exports.default = callWithRetry;
