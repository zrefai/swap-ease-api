const fs = require('fs');

export function writeToJSON(data: any) {
  const json = JSON.stringify(data);

  fs.writeFile('results.json', json, 'utf8', function (err: any) {
    if (err) throw err;
    console.log('file written complete');
  });
}
