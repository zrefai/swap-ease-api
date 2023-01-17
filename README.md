# SwapEase API

This repository is the backend of the SwapEase experience.

List of capabilities:

- Ranking an NFT collection
- Retrieving results from a ranked collection

Future endeavors:

- Retrieving clusters from a ranked collection
- Token to Token trading
- Value prediction

### Installing dependencies

Run `yarn` to install all dependencies

### Spinning up the project

Run `yarn build` to build the project

Run `yarn dev` to start the server

There is an associated postman collection to use the endpoints.

### Scoring Algorithm

![picture](./public/scoring_algo.png)

- Total Score comprises of total rarity score of all traits of an NFT + the score of the count of traits across the whole collection + the total rarity score for all missing traits types of an NFT
