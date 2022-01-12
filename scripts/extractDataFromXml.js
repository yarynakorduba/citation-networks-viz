const fs = require('fs');
const util = require('util');
const chalk = require('chalk');
const R = require('ramda');
const JSSoup = require('jssoup').default;

const readDir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// npm run extract:xml:data ./src/assets/documentAndMetadataCollection/ ./src/assets/citeData-try-to-clean.json ./src/assets/authData-try-to-clean.json

const getArgs = () => {
  const inputDirectoryPath = process.argv[2];
  const outputJSONCitationFilePath = process.argv[3];
  const outputJSONAuthorFilePath = process.argv[4];
  if (!inputDirectoryPath || !outputJSONCitationFilePath || !outputJSONAuthorFilePath) {
    throw new Error(
      `Please provide the paths for an input and two output files.
The format:
$ npm run extract:xml:data <path to input file> <path to cite data output file> <path to author data output file>`,
    );
  }
  return { inputDirectoryPath, outputJSONCitationFilePath, outputJSONAuthorFilePath };
};

const XML_EXTENSION = '.xml';
const getXMLFilePaths = async (directory) => {
  console.log(chalk.greenBright(`Searching for XML files in the directory ${directory}...`));
  const contents = await readDir(directory);
  const files = await Promise.all(
    contents.map(async (item) => {
      const path = `${directory}/${item}`;
      const pathStat = await stat(path);
      return pathStat.isDirectory() ? await getXMLFilePaths(path) : path;
    }),
  );
  const flattenedFiles = files.flatMap((f) => f);
  const filteredFiles = flattenedFiles.filter((file) => file.indexOf(XML_EXTENSION) !== -1);
  return filteredFiles;
};

const safeGetText = (tag) => (tag ? tag.getText() : '');

const getAuthors = R.compose(
  R.filter(({ forename, surname }) => {
    return !(surname === '' || R.includes('†', [forename, surname]));
  }),
  R.map((tag) => {
    const forename = R.compose(
      R.toUpper,
      (word) => word.replace(/[ +-]+$/gi, '').trim(),
      R.head,
      R.trim,
      safeGetText,
      (t) => t.find('forename'),
    )(tag);

    const surname = R.compose(
      R.trim(),
      R.join(' '),
      R.map((word) => word.replace(/[ +-]+$/gi, '').trim()),
      R.map(safeGetText),
      (t) => t.findAll('surname'),
    )(tag);

    return { forename, surname };
  }),
);

const retrieveDataFromFileAsJSON = async (filePath) => {
  console.log(chalk.magentaBright(`Starting retrieval of the data from file: ${filePath}`));

  const fileContent = await readFile(filePath, 'utf8');
  try {
    const soup = new JSSoup(fileContent);
    const TEIsoup = soup.find('TEI');
    const isHasContents = TEIsoup && TEIsoup.contents.length;
    if (!isHasContents) return undefined;

    const title = R.compose(
      (titleSoup) => (titleSoup && safeGetText(titleSoup.find('title'))) || '',
      (s) => s.find('titleStmt'),
    )(soup);

    const authorTags = R.compose(
      (analyticSoup) => (analyticSoup && analyticSoup.findAll('author')) || [],
      (s) => s.find('analytic'),
    )(soup);

    const authors = getAuthors(authorTags);

    const keywords = R.compose(
      R.map((tag) => tag.getText()),
      (keywordsSoup) => (keywordsSoup && keywordsSoup.findAll('term')) || [],
      (s) => s.find('keywords'),
    )(soup);

    const citations = R.compose(
      R.map(
        (analyticsSoup) =>
          analyticsSoup && {
            title: analyticsSoup.find('title').getText(),
            authors: getAuthors(analyticsSoup.findAll('author')),
          },
      ),
      (s) => s && s.findAll('biblStruct'),
      (s) => s && s.find('listBibl'),
    )(soup);

    return {
      filePath,
      title,
      authors,
      keywords,
      citations,
    };
  } catch (error) {
    console.log(chalk.redBright(`Retrieval of the data failed for file ${filePath}`, error));
    throw error;
  }
};

const convertDataForCitationGraph = (data) => {
  const citationCount = R.compose(
    R.reduce(
      (accum, citation) => ({
        ...accum,
        [citation.title]: (accum[citation.title] || 0) + 1, // number of occurences per citation
      }),
      {},
    ),
    R.flatten,
    R.map(R.prop('citations')),
  )(data);

  const papersObject = R.indexBy(R.prop('title'), data);

  const papersWithCitedBy = R.map((paper) => {
    const citedBy = (paper.title && citationCount[paper.title]) || 0;

    const filteredCitations = R.filter((citation) => citation.title && !!papersObject[citation.title], paper.citations);

    return { ...paper, citations: filteredCitations, citedBy };
  }, data);
  return papersWithCitedBy;
};

const convertDataForAuthorGraph = (data) => {
  const authors = R.reduce(
    (accum, paper) => {
      const { authors: authorsAccum, coauthorships: coauthorshipsAccum } = accum;
      let paperAuthors = { ...authorsAccum };
      let paperCoauthorships = { ...coauthorshipsAccum };
      for (let i = 0; i < paper.authors.length; i++) {
        const firstAuthorName = `${paper.authors[i].forename}-${paper.authors[i].surname}`;
        const existingFirstAuthorProp = R.pathOr(paper.authors[i], [firstAuthorName], paperAuthors);
        const authorPapersCount = R.pathOr(0, ['papersCount'], existingFirstAuthorProp);
        const authorPapers = R.pathOr([], ['papers'], existingFirstAuthorProp);
        paperAuthors = {
          ...paperAuthors,
          [firstAuthorName]: {
            ...existingFirstAuthorProp,
            papersCount: authorPapersCount + 1,
            papers: [...authorPapers, { title: paper.title, authors: paper.authors }],
          },
        };
        for (let j = i + 1; j < paper.authors.length; j++) {
          const secondAuthorName = `${paper.authors[j].forename}-${paper.authors[j].surname}`;
          const coAuthKey = R.compose(
            R.join('_'),
            R.sort((a, b) => a - b),
          )([firstAuthorName, secondAuthorName]);

          const coauthorship = paperCoauthorships[coAuthKey] || {};
          const papers = coauthorship.papers || [];

          paperCoauthorships = {
            ...paperCoauthorships,
            [coAuthKey]: {
              ...coauthorship,
              firstAuthor: firstAuthorName,
              secondAuthor: secondAuthorName,
              papers: [...papers, paper.title],
            },
          };
        }
      }
      return { authors: paperAuthors, coauthorships: paperCoauthorships };
    },
    { authors: {}, coauthorships: {} },
    data,
  );
  return authors;
};

const run = async () => {
  console.clear();
  try {
    const { inputDirectoryPath, outputJSONCitationFilePath, outputJSONAuthorFilePath } = getArgs();

    const filePaths = await getXMLFilePaths(inputDirectoryPath);
    const data = await Promise.all(R.map(retrieveDataFromFileAsJSON)(filePaths));
    const filteredData = R.filter((item) => {
      return !!item && item.title && item.authors && item.authors.length;
    }, data);

    // const convertedCiteData = convertDataForCitationGraph(filteredData);
    const convertedAuthorData = convertDataForAuthorGraph(filteredData);

    // const formattedCiteData = R.compose(JSON.stringify)(convertedCiteData);
    const formattedAuthorData = R.compose(JSON.stringify)(convertedAuthorData);

    // console.log(chalk.greenBright(`Writing the citation data to JSON file: ${outputJSONCitationFilePath}`));
    console.log(chalk.greenBright(`Writing the author data to JSON file: ${outputJSONAuthorFilePath}`));

    // await writeFile(outputJSONCitationFilePath, formattedCiteData);
    await writeFile(outputJSONAuthorFilePath, formattedAuthorData);

    return { formattedCiteData: [], formattedAuthorData };
  } catch (error) {
    console.error('error', error);
  }
};

if (process.env.AS_CMD) run();
