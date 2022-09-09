"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const timer = (ms) => new Promise((res) => setTimeout(res, ms));
exports.default = timer;
