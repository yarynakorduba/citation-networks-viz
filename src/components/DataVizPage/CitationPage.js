import { useState, useEffect } from 'react';
import { toLower, includes } from 'ramda';

import CitationGraph from '../Graph/CitationGraph';
import Search from '../Search';

import { useLoadData, useSearchWithNodeHighlighting } from '../../hooks/graph';

function CitationPage() {
  const [data] = useLoadData('citeData.json');

  const [formattedData, setFormattedData] = useState('');
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

  const { searchInput, setSearchInput } = useSearchWithNodeHighlighting(formattedData, searcher);

  return (
    <div>
      <div className="coauthorship-filter-container">
        <Search className="coauthorship-search" value={searchInput} setValue={setSearchInput} />
      </div>
      <button>Test</button>
      <CitationGraph data={formattedData} />
    </div>
  );
}

export default CitationPage;
