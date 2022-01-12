import { useState } from 'react';

import { useLoadData } from '../../hooks/graph';

import CoauthorshipGraph from '../Graph/CoauthorshipGraph';
import Search from '../Search';

function CoauthorshipPage() {
  const [data] = useLoadData('authData.json');

  const [searchInput, setSearchInput] = useState('');
  const [selectedNode, setSelectedNode] = useState(undefined);

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
