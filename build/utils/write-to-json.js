"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeToJSON = void 0;
const fs = require('fs');
function writeToJSON(data) {
    const json = JSON.stringify(data);
    fs.writeFile('results.json', json, 'utf8', function (err) {
        if (err)
            throw err;
        console.log('file written complete');
    });
}
exports.writeToJSON = writeToJSON;
