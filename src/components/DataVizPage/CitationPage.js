import { useState, useMemo } from 'react';
import { toLower, includes } from 'ramda';
import CitationGraph from '../Graph/CitationGraph';
import Search from '../Search';

import { useLoadData } from '../../hooks/graph';
import { useEffect } from 'react/cjs/react.development';

function CitationPage() {
  const [searchInput, setSearchInput] = useState('');
  const [data] = useLoadData('citeData.json');

  const [formattedData, seFormattedData] = useState('');

  const lowerSearchInput = useMemo(() => toLower(searchInput), [searchInput]);
  useEffect(() => {
    if (!searchInput) {
      seFormattedData(data);
    } else {
      const updatedData = data.map(({ title, authors, ...rest }) => {
        const authorsString = authors.map(({ forename, surname }) => `${forename} ${surname}`).join(' ');
        const stringToCompare = toLower(`${title} ${authorsString}`);
        const isHighlighted = includes(lowerSearchInput, stringToCompare);
        return {
          ...rest,
          title,
          authors,
          isHighlighted,
        };
      });
      seFormattedData(updatedData);
    }
  }, [data, lowerSearchInput, searchInput]);

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
