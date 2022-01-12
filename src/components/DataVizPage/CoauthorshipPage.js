import { useState, useMemo, useCallback } from 'react';
import { compose, values, mapObjIndexed, toLower, includes } from 'ramda';

import { useLoadData, useSearchWithNodeHighlighting } from '../../hooks/graph';

import CoauthorshipGraph from '../Graph/CoauthorshipGraph';
import Search from '../Search';

function CoauthorshipPage() {
  const [data] = useLoadData('authData1.json');

  const [selectedNode, setSelectedNode] = useState(undefined);

  const formattedAuthorsForSearch = useMemo(
    () =>
      compose(
        (d) => d,
        (d) => values(d),
        mapObjIndexed((author, id) => ({
          ...author,
          id,
        })),
      )(data.authors),
    [data],
  );

  const searcher = useCallback(
    (lowerSearchInput) =>
      ({ id, forename, surname }) => {
        const stringToCompare = toLower(`${forename} ${surname}`);
        const isHighlighted = includes(lowerSearchInput, stringToCompare);
        return { id, isHighlighted };
      },
    [],
  );

  const { searchInput, setSearchInput } = useSearchWithNodeHighlighting(formattedAuthorsForSearch, searcher);

  return (
    <div className="coauthorship-graph-container">
      <div className="coauthorship-results">
        <div className="coauthorship-filter-container">
          <Search className="coauthorship-search" value={searchInput} setValue={setSearchInput} />
        </div>
        {selectedNode ? (
          <div className="author-info">
            <div className="author-info-title">{selectedNode.fullName}</div>
            <div className="author-info-list">
              {selectedNode.papers.map((paper, i) => (
                <div key={i} className="author-info-list-item">
                  <div className="author-info-list-item-title">{paper.title}</div>
                  <div className="author-info-list-item-subtitle">{paper.authorNames.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="item">
            <div className="item-title">No coauthorship node selected.</div>
            <div className="item-subtitle">Click on a red node to view more information.</div>
          </div>
        )}
      </div>
      <CoauthorshipGraph data={data} setSelectedNode={setSelectedNode} />
    </div>
  );
}

export default CoauthorshipPage;
