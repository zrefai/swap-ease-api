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
require("./routes");
const swap_ease_db_client_1 = __importDefault(require("./config/swap-ease-db-client"));
const express_1 = require("./config/express");
require('dotenv').config();
const verifyEnvVariables = (keys) => {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!(key in process.env) || !process.env[key]) {
            throw new Error(`Environment variable ${key} cannot be empty`);
        }
    }
};
const port = process.env.PORT || 8000;
verifyEnvVariables([
    'MONGO_DB_CONNECTION_STRING',
    'MONGO_DB_NAME',
    'ALCHEMY_API_KEY',
    'ALCHEMY_API_NFT_URL',
    'CERT_FILE',
    'CERT_PASS',
]);
function startServer(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.createServer)();
        app.listen(port, () => {
            console.log('Server is running on port', port);
        });
        const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
        signalTraps.forEach((type) => {
            process.on(type, () => {
                console.log(`process.on ${type}`);
                db.close();
                process.exit(0);
            });
        });
    });
}
swap_ease_db_client_1.default
    .then((v) => {
    console.log('DB client connected');
    startServer(v);
})
    .catch((reason) => {
    console.log(reason);
});
