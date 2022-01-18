import { useState, useEffect } from 'react';
import { toLower, includes, equals, gt, lt } from 'ramda';

import CitationGraph from '../Graph/CitationGraph';
import Search from '../Search';

import { useLoadData, useSearchWithNodeHighlighting } from '../../hooks/graph';

function CitationPage() {
  const [data] = useLoadData('citeData.json');
  const [formattedData, setFormattedData] = useState('');
  const [selectedNode, setSelectedNode] = useState(undefined);

  useEffect(() => {
    const updatedData = data.map(({ title, ...paper }) => ({
      ...paper,
      id: title,
      title,
    }));
    setFormattedData(updatedData);
  }, [setFormattedData, data]);

  const searcher =
    (lowerSearchInput) =>
    ({ id, title, authors }) => {
      const authorsString = authors.map(({ forename, surname }) => `${forename} ${surname}`).join(' ');
      const stringToCompare = toLower(`${title} ${authorsString}`);
      const isHighlighted = includes(lowerSearchInput, stringToCompare);
      return { id, isHighlighted };
    };

  const searcherNumberOfCitations =
    (input) =>
    ({ id, citedBy }) => {
      const isHighlighted = equals(parseInt(input), citedBy);
      return { id, isHighlighted };
    };

  const searchYear =
    (input) =>
    ({ id, year }) => {
      console.log({ year, input });
      const isHighlighted = equals(input, year);
      return { id, isHighlighted };
    };

  const searchYearFrom =
    (input) =>
    ({ id, year }) => {
      const isHighlighted = gt(parseInt(year), parseInt(input));
      return { id, isHighlighted };
    };

  const searchYearTo =
    (input) =>
    ({ id, year }) => {
      const isHighlighted = lt(parseInt(year), parseInt(input));
      return { id, isHighlighted };
    };

  const { searchInput, setSearchInput } = useSearchWithNodeHighlighting(formattedData, searcher);
  const { searchInput: numberOfCitationsInput, setSearchInput: setNumberOfCitationsInput } =
    useSearchWithNodeHighlighting(formattedData, searcherNumberOfCitations);
  const { searchInput: yearSearchInput, setSearchInput: setYearSearchInput } = useSearchWithNodeHighlighting(
    formattedData,
    searchYear,
  );
  const { searchInput: yearFromSearchInput, setSearchInput: setYearFromSearchInput } = useSearchWithNodeHighlighting(
    formattedData,
    searchYearFrom,
  );
  const { searchInput: yearToSearchInput, setSearchInput: setYearToSearchInput } = useSearchWithNodeHighlighting(
    formattedData,
    searchYearTo,
  );

  return (
    <div className="coauthorship-graph-container">
      <div className="coauthorship-results">
        <div className="coauthorship-filter-container">
          <Search
            placeholder="Search by author"
            className="coauthorship-search"
            value={searchInput}
            setValue={setSearchInput}
          />
          <Search
            className="coauthorship-search mt-2"
            placeholder="Search by number of citations"
            value={numberOfCitationsInput}
            setValue={setNumberOfCitationsInput}
          />
          <Search
            className="coauthorship-search mt-2"
            placeholder="Search by year"
            value={yearSearchInput}
            setValue={setYearSearchInput}
          />
          <Search
            className="coauthorship-search mt-2"
            placeholder="Year from"
            value={yearFromSearchInput}
            setValue={setYearFromSearchInput}
          />
          <Search
            className="coauthorship-search mt-2"
            placeholder="Year to"
            value={yearToSearchInput}
            setValue={setYearToSearchInput}
          />
        </div>
        {selectedNode ? (
          <div className="author-info">
            <div className="author-info-title">{selectedNode.title}</div>
            <div className="author-list">
              <b>Authors:</b> {selectedNode.authorNames.join(', ')}
            </div>
            <div className="author-list mt-2">
              <b>Keywords:</b>{' '}
              {selectedNode.keywords.length !== 0 ? selectedNode.keywords.join(', ') : 'No keywords found!'}
            </div>
          </div>
        ) : (
          <div className="item">
            <div className="item-title">No coauthorship node selected.</div>
            <div className="item-subtitle">Click on a red node to view more information.</div>
          </div>
        )}
      </div>
      <CitationGraph data={formattedData} setSelectedNode={setSelectedNode} />
    </div>
  );
}

export default CitationPage;
