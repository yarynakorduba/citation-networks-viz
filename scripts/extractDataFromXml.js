const fs = require('fs');
const util = require('util');
const chalk = require('chalk');
const R = require('ramda');
const JSSoup = require('jssoup').default;

const readDir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// npm run extract:xml:data ./src/assets/document_and_metatata_collection/ ./src/assets/output.json

const getArgs = () => {

    const inputDirectoryPath = process.argv[2];
    const outputJSONFilePath = process.argv[3];
    if (!inputDirectoryPath || !outputJSONFilePath) {
      throw new Error(
`Please provide the paths for both input and output files.
The format:
$ npm run extract:xml:data <path to input file> <path to output file>`
      )
    }
    return { inputDirectoryPath, outputJSONFilePath }
  };

const XML_EXTENSION = '.xml';
const getXMLFilePaths = async (directory) => {
  console.log(chalk.greenBright(`Searching for XML files in the directory ${directory}...`));
  const contents = await readDir(directory);
  const files = await Promise.all(contents.map(async (item) => {
    const path = `${directory}/${item}`;
    const pathStat = await stat(path);
    return (pathStat.isDirectory()) ? await getXMLFilePaths(path) : path;
  }));
  const flattenedFiles = files.flatMap(f => f);
  const filteredFiles = flattenedFiles.filter(file => file.indexOf(XML_EXTENSION) !== -1);
  return filteredFiles;
}

const safeGetText = tag => tag ? tag.getText() : '';

const getAuthors = R.map(tag => {
  const forename = safeGetText(tag.find('forename'));
  const surname = safeGetText(tag.find('surname'));
  return { forename, surname }
});

const retrieveDataFromFileAsJSON = async (filePath) => {
  console.log(chalk.magentaBright(`Starting retrieval of the data from file: ${filePath}`));

  const fileContent = await readFile(filePath, 'utf8');
  try {
    const soup = new JSSoup(fileContent);

    const authorTags = R.compose(
      analyticSoup => analyticSoup && analyticSoup.findAll('author') || [],
      s => s.find("analytic")
    )(soup)

    const authors = getAuthors(authorTags);

    const keywords = R.compose(
      R.map(tag => tag.getText()),
      keywordsSoup => keywordsSoup && keywordsSoup.findAll('term') || [],
      s => s.find('keywords'),
    )(soup);

    const citations = R.compose(
      R.map(titleSoup => ({
        title: titleSoup.getText(),
        authors: getAuthors(titleSoup.parent.findAll('author'))
      })),
      biblSoup => biblSoup ? biblSoup.findAll('title') : [],
      s => s.find('biblStruct')
    )(soup)

    return {
      authors,
      keywords,
      citations
    }

  } catch(error) {
    console.log(chalk.redBright(`Retrieval of the data failed for file ${filePath}`, error));
    throw error;
  }
}

const run = async () => {
    console.clear();
    try {
      const { inputDirectoryPath, outputJSONFilePath } = getArgs();

      const filePaths = await getXMLFilePaths(inputDirectoryPath);
      const data = await Promise.all(R.map(retrieveDataFromFileAsJSON)(filePaths));

      console.log(chalk.greenBright(`Writing the data to JSON file: ${outputJSONFilePath}`));

      const stringifiedData = JSON.stringify(data);
      await writeFile(outputJSONFilePath, stringifiedData);
      return data;

    } catch (error) {
      console.error("error", error);
    }
  };

  if (process.env.AS_CMD) run();
