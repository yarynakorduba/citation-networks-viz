const fs = require('fs');
const util = require('util');
const chalk = require('chalk');
const R = require('ramda');
const JSSoup = require('jssoup').default;

const readDir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// npm run extract:xml:data ./src/assets/documentAndMetadataCollection/ ./src/assets/data.json

const getArgs = () => {
    const inputDirectoryPath = process.argv[2];
    const outputJSONFilePath = process.argv[3];
    if (!inputDirectoryPath || !outputJSONFilePath) {
        throw new Error(
            `Please provide the paths for both input and output files.
The format:
$ npm run extract:xml:data <path to input file> <path to output file>`,
        );
    }
    return { inputDirectoryPath, outputJSONFilePath };
};

const XML_EXTENSION = '.xml';
const getXMLFilePaths = async (directory) => {
    console.log(
        chalk.greenBright(
            `Searching for XML files in the directory ${directory}...`,
        ),
    );
    const contents = await readDir(directory);
    const files = await Promise.all(
        contents.map(async (item) => {
            const path = `${directory}/${item}`;
            const pathStat = await stat(path);
            return pathStat.isDirectory() ? await getXMLFilePaths(path) : path;
        }),
    );
    const flattenedFiles = files.flatMap((f) => f);
    const filteredFiles = flattenedFiles.filter(
        (file) => file.indexOf(XML_EXTENSION) !== -1,
    );
    return filteredFiles;
};

const safeGetText = (tag) => (tag ? tag.getText() : '');

const getAuthors = R.map((tag) => {
    const forename = safeGetText(tag.find('forename'));
    const surname = safeGetText(tag.find('surname'));
    return { forename, surname };
});

const retrieveDataFromFileAsJSON = async (filePath) => {
    console.log(
        chalk.magentaBright(
            `Starting retrieval of the data from file: ${filePath}`,
        ),
    );

    const fileContent = await readFile(filePath, 'utf8');
    try {
        const soup = new JSSoup(fileContent);
        const TEIsoup = soup.find('TEI');
        const isHasContents = TEIsoup && TEIsoup.contents.length;
        if (!isHasContents) return undefined;

        const title = R.compose(
            (titleSoup) =>
                (titleSoup && safeGetText(titleSoup.find('title'))) || '',
            (s) => s.find('titleStmt'),
        )(soup);

        const authorTags = R.compose(
            (analyticSoup) =>
                (analyticSoup && analyticSoup.findAll('author')) || [],
            (s) => s.find('analytic'),
        )(soup);

        const authors = getAuthors(authorTags);

        const keywords = R.compose(
            R.map((tag) => tag.getText()),
            (keywordsSoup) =>
                (keywordsSoup && keywordsSoup.findAll('term')) || [],
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
            title,
            authors,
            keywords,
            citations,
        };
    } catch (error) {
        console.log(
            chalk.redBright(
                `Retrieval of the data failed for file ${filePath}`,
                error,
            ),
        );
        throw error;
    }
};

const convertData = (papers) => {
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
    )(papers);

    const papersObject = R.indexBy(R.prop('title'), papers);

    const papersWithCitedBy = R.map((paper) => {
        const citedBy = (paper.title && citationCount[paper.title]) || 0;

        const filteredCitations = R.filter(
            (citation) => citation.title && !!papersObject[citation.title],
            paper.citations,
        );

        return { ...paper, citations: filteredCitations, citedBy };
    }, papers);
    return papersWithCitedBy;
};

const run = async () => {
    console.clear();
    try {
        const { inputDirectoryPath, outputJSONFilePath } = getArgs();

        const filePaths = await getXMLFilePaths(inputDirectoryPath);
        const data = await Promise.all(
            R.map(retrieveDataFromFileAsJSON)(filePaths),
        );
        const filteredData = R.filter((item) => !!item, data);
        const convertedData = convertData(filteredData);

        const formattedData = R.compose(JSON.stringify)(convertedData);

        console.log(
            chalk.greenBright(
                `Writing the data to JSON file: ${outputJSONFilePath}`,
            ),
        );

        await writeFile(outputJSONFilePath, formattedData);
        return formattedData;
    } catch (error) {
        console.error('error', error);
    }
};

if (process.env.AS_CMD) run();
