import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [keyword, setKeyword] = useState('');

  const searchHandler = (e) => {
    e.preventDefault();
    const value = keyword.trim();
    navigate(value ? `/search/${value}` : '/');
  };

  useEffect(() => {
    if (location.pathname === '/') {
      setKeyword('');
    }
  }, [location]);

  return (
    <form onSubmit={searchHandler} className="ajwa-search-form">
      <i className="fa fa-search" aria-hidden="true"></i>
      <input
        type="text"
        id="search_field"
        className="ajwa-search-input"
        placeholder="Search Ajwa.in"
        onChange={(e) => {
          setKeyword(e.target.value);
        }}
        value={keyword}
      />
      <button type="submit" className="ajwa-hidden-submit" aria-label="Search"></button>
    </form>
  );
}
