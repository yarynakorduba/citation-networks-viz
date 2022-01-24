# Citation & Authorship networks

This is the data digital libraries course project. The goal of this project is to explore the processes and find the patterns in forming the citation & authorship networks.

## Dataset

### Dataset processing
We created an `npm` script for dataset processing. You can find the script under `./scripts/extractDataFromXml.js`.
To run the script using npm, put your dataset folder under `src/assets/` and run:
```
npm run extract:xml:data ./src/assets/<dataset folder>/ ./public/<resulting citation dataset>.json ./public/<resulting co-authorship dataset>.json
```

You can find already created datasets, which are currently used in the project under `./public/authorData.json` and `./public/citeData.json`.

## Starting the project

To start the project, open the terminal and run these commands

```
npm install
npm run start
```

## Demo
You can access the demo version by this link: [https://yarynakorduba.github.io/citation-networks-viz/]()

