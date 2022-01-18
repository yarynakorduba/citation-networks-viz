import { memo } from 'react';

import './Search.scss';

const Search = ({ className, value, setValue, placeholder }) => {
  const handleChange = ({ target: { value } }) => {
    setValue(value);
  };

  return (
    <div className={`Search ${className}`}>
      <input className="Search__input" placeholder={placeholder} value={value} onChange={handleChange} />
    </div>
  );
};

export default memo(Search);
